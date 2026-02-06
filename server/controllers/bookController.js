const prisma = require("../prismaClient");

exports.addBooking = async (req, res) => {
    try {
        const { tripId, type, provider, pnr, cost, departureTime, arrivalTime } = req.body;

        const booking = await prisma.booking.create({
            data: {
                tripId,
                type,
                provider,
                pnr,
                cost,
                departureTime: new Date(departureTime),
                arrivalTime: arrivalTime ? new Date(arrivalTime) : null
            }
        });
        res.status(201).json(booking);
    } catch (err) {
        res.status(500).json({ message: "Failed to add booking" });
    }
};

exports.getBookings = async (req, res) => {
    try {
        const bookings = await prisma.booking.findMany({
            where: { tripId: Number(req.params.tripId) }
        });

        res.json(bookings);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch bookings" });
    }
};