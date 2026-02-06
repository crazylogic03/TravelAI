const prisma = require("../prismaClient");

exports.addBooking = async (req, res) => {
    try {
        const booking = await prisma.booking.create({ data: req.body });
        res.status(201).json(booking);
    } catch {
        res.status(500).json({ message: "Booking failed" });
    }
};

exports.getBookings = async (req, res) => {
    const bookings = await prisma.booking.findMany({
        where: { tripId: Number(req.params.tripId) }
    });
    res.json(bookings);
};