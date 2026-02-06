const prisma = require("../prisma/client");

exports.createTrip = async (req, res) => {
    const trip = await prisma.trip.create({
        data: { ...req.body, userId: req.user.id }
    });
    res.json(trip);
};

exports.getTrips = async (req, res) => {
    const trips = await prisma.trip.findMany({
        where: { userId: req.user.id }
    });
    res.json(trips);
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