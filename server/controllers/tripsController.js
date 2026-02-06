const prisma = require("../prisma/client");

const VALID_STATUSES = ["PLANNED", "ONGOING", "COMPLETED", "CANCELLED"];


exports.createTrip = async (req, res) => {
    try {
        const { name, budget, startDate, endDate, source } = req.body;

        if (!name || !budget || !startDate || !endDate || !source) {
            return res.status(400).json({ message: "Missing trip details" });
        }

        const trip = await prisma.trip.create({
            data: {
                name,
                budget: Number(budget),
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                source,
                userId: req.user.id
            }
        });

        res.status(201).json(trip);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to create trip" });
    }
};


exports.getTrips = async (req, res) => {
    try {
        const trips = await prisma.trip.findMany({
            where: { userId: req.user.id },
            orderBy: { startDate: "desc" }
        });

        res.json(trips);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch trips" });
    }
};


exports.getTripDetails = async (req, res) => {
    try {
        const tripId = Number(req.params.tripId);
        if (isNaN(tripId))
            return res.status(400).json({ message: "Invalid trip ID" });

        const trip = await prisma.trip.findFirst({
            where: { id: tripId, userId: req.user.id },
            include: {
                itinerary: {
                    include: { destination: true },
                    orderBy: [{ dayNumber: "asc" }, { orderIndex: "asc" }]
                }
            }
        });

        if (!trip)
            return res.status(404).json({ message: "Trip not found" });

        res.json(trip);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch trip details" });
    }
};


exports.addItineraryItem = async (req, res) => {
    try {
        const tripId = Number(req.params.tripId);
        const { destinationId, dayNumber, orderIndex } = req.body;

        if (!destinationId || dayNumber == null || orderIndex == null)
            return res.status(400).json({ message: "Missing itinerary data" });

        const trip = await prisma.trip.findFirst({
            where: { id: tripId, userId: req.user.id },
            include: {
                itinerary: { include: { destination: true } }
            }
        });

        if (!trip)
            return res.status(404).json({ message: "Trip not found" });

        const destination = await prisma.destination.findUnique({
            where: { id: Number(destinationId) }
        });

        if (!destination)
            return res.status(404).json({ message: "Destination not found" });

        const usedBudget = trip.itinerary.reduce(
            (sum, i) => sum + i.destination.avgCost,
            0
        );

        if (usedBudget + destination.avgCost > trip.budget)
            return res.status(400).json({ message: "Budget exceeded" });

        const item = await prisma.itineraryItem.create({
            data: {
                tripId,
                destinationId,
                dayNumber,
                orderIndex
            }
        });

        res.status(201).json(item);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to add destination" });
    }
};


exports.deleteItineraryItem = async (req, res) => {
    try {
        const itemId = Number(req.params.itemId);

        const item = await prisma.itineraryItem.findUnique({
            where: { id: itemId },
            include: { trip: true }
        });

        if (!item || item.trip.userId !== req.user.id)
            return res.status(404).json({ message: "Itinerary item not found" });

        await prisma.itineraryItem.delete({ where: { id: itemId } });
        res.json({ message: "Destination removed from trip" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to remove destination" });
    }
};


exports.voteDestination = async (req, res) => {
    try {
        const destinationId = Number(req.params.destinationId);
        if (isNaN(destinationId))
            return res.status(400).json({ message: "Invalid destination ID" });

        const destination = await prisma.destination.findUnique({
            where: { id: destinationId }
        });

        if (!destination)
            return res.status(404).json({ message: "Destination not found" });

        const updated = await prisma.destination.update({
            where: { id: destinationId },
            data: { popularity: { increment: 1 } }
        });

        res.json({ popularity: updated.popularity });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to vote destination" });
    }
};



exports.updateTripStatus = async (req, res) => {
    try {
        const tripId = Number(req.params.tripId);
        const { status } = req.body;

        if (!VALID_STATUSES.includes(status))
            return res.status(400).json({ message: "Invalid trip status" });

        const trip = await prisma.trip.findFirst({
            where: { id: tripId, userId: req.user.id }
        });

        if (!trip)
            return res.status(404).json({ message: "Trip not found" });

        const updated = await prisma.trip.update({
            where: { id: tripId },
            data: { status }
        });

        res.json(updated);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to update trip status" });
    }
};