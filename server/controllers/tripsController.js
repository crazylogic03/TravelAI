const prisma = require("../prisma/client");

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
        console.error("Create trip error:", err);
        res.status(500).json({ message: "Failed to create trip" });
    }
};

exports.getTrips = async (req, res) => {
    try {
        const trips = await prisma.trip.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: "desc" }
        });

        res.status(200).json(trips);
    } catch (err) {
        console.error("Get trips error:", err);
        res.status(500).json({ message: "Failed to fetch trips" });
    }
};

exports.getTripDetails = async (req, res) => {
    try {
        const tripId = Number(req.params.tripId);

        if (isNaN(tripId)) {
            return res.status(400).json({ message: "Invalid trip ID" });
        }

        const trip = await prisma.trip.findFirst({
            where: {
                id: tripId,
                userId: req.user.id
            },
            include: {
                itinerary: {
                    include: {
                        destination: true
                    },
                    orderBy: [
                        { dayNumber: "asc" },
                        { orderIndex: "asc" }
                    ]
                },
                bookings: true
            }
        });

        if (!trip) {
            return res.status(404).json({ message: "Trip not found" });
        }

        res.status(200).json(trip);
    } catch (err) {
        console.error("Get trip details error:", err);
        res.status(500).json({ message: "Failed to fetch trip details" });
    }
};


exports.addItineraryItem = async (req, res) => {
    try {
        const tripId = Number(req.params.tripId);
        const { destinationId, dayNumber, orderIndex } = req.body;

        if (!destinationId || !dayNumber || orderIndex === undefined) {
            return res.status(400).json({ message: "Missing itinerary data" });
        }

        const trip = await prisma.trip.findFirst({
            where: { id: tripId, userId: req.user.id },
            include: {
                itinerary: {
                    include: { destination: true }
                }
            }
        });

        if (!trip) {
            return res.status(404).json({ message: "Trip not found" });
        }

        const destination = await prisma.destination.findUnique({
            where: { id: Number(destinationId) }
        });

        if (!destination) {
            return res.status(404).json({ message: "Destination not found" });
        }

        const currentCost = trip.itinerary.reduce(
            (sum, item) => sum + item.destination.avgCost,
            0
        );

        if (currentCost + destination.avgCost > trip.budget) {
            return res.status(400).json({ message: "Budget exceeded" });
        }

        const itineraryItem = await prisma.itineraryItem.create({
            data: {
                tripId,
                destinationId: Number(destinationId),
                dayNumber: Number(dayNumber),
                orderIndex: Number(orderIndex)
            }
        });

        res.status(201).json(itineraryItem);
    } catch (err) {
        console.error("Add itinerary item error:", err);
        res.status(500).json({ message: "Failed to add itinerary item" });
    }
};
exports.deleteItineraryItem = async (req, res) => {
    try {
        const itemId = Number(req.params.itemId);

        const item = await prisma.itineraryItem.findUnique({
            where: { id: itemId },
            include: { trip: true }
        });

        if (!item || item.trip.userId !== req.user.id) {
            return res.status(404).json({ message: "Itinerary item not found" });
        }

        await prisma.itineraryItem.delete({
            where: { id: itemId }
        });

        res.status(200).json({ message: "Itinerary item removed" });
    } catch (err) {
        console.error("Delete itinerary item error:", err);
        res.status(500).json({ message: "Failed to remove itinerary item" });
    }
};



exports.updateTripStatus = async (req, res) => {
    try {
        const tripId = Number(req.params.tripId);
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ message: "Status is required" });
        }

        const trip = await prisma.trip.findFirst({
            where: { id: tripId, userId: req.user.id }
        });

        if (!trip) {
            return res.status(404).json({ message: "Trip not found" });
        }

        const updatedTrip = await prisma.trip.update({
            where: { id: tripId },
            data: { status }
        });

        res.status(200).json(updatedTrip);
    } catch (err) {
        console.error("Update trip status error:", err);
        res.status(500).json({ message: "Failed to update trip status" });
    }
};

exports.addDestination = async (req, res) => {
    const dest = await prisma.destination.create({
        data: { ...req.body, tripId: Number(req.params.tripId) }
    });
    res.json(dest);
};




exports.voteDestination = async (req, res) => {
    try {
        const destinationId = Number(req.params.destinationId);

        if (isNaN(destinationId)) {
            return res.status(400).json({ message: "Invalid destination ID" });
        }

        const destination = await prisma.destination.findUnique({
            where: { id: destinationId }
        });

        if (!destination) {
            return res.status(404).json({ message: "Destination not found" });
        }

        const updated = await prisma.destination.update({
            where: { id: destinationId },
            data: {
                popularity: { increment: 1 }
            }
        });

        res.status(200).json({
            message: "Vote recorded",
            popularity: updated.popularity
        });
    } catch (err) {
        console.error("Vote destination error:", err);
        res.status(500).json({ message: "Failed to vote destination" });
    }
};

exports.deleteDestination = async (req, res) => {
    await prisma.destination.delete({
        where: { id: Number(req.params.destId) }
    });
    res.json({ message: "Destination removed" });
};