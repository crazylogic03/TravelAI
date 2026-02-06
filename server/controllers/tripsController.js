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
    const trip = await prisma.trip.findUnique({
        where: { id: Number(req.params.tripId) },
        include: { destinations: true, bookings: true }
    });
    res.json(trip);
};

exports.addDestination = async (req, res) => {
    const dest = await prisma.destination.create({
        data: { ...req.body, tripId: Number(req.params.tripId) }
    });
    res.json(dest);
};

exports.voteDestination = async (req, res) => {
    const dest = await prisma.destination.update({
        where: { id: Number(req.params.destId) },
        data: { votes: { increment: 1 } }
    });
    res.json(dest);
};

exports.deleteDestination = async (req, res) => {
    await prisma.destination.delete({
        where: { id: Number(req.params.destId) }
    });
    res.json({ message: "Destination removed" });
};