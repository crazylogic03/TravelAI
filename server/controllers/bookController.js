const prisma = require("../prismaClient");

exports.addBooking = async (req, res) => {
    const booking = await prisma.booking.create({ data: req.body });
    res.json(booking);
};

exports.getBookings = async (req, res) => {
    const bookings = await prisma.booking.findMany({
        where: { tripId: Number(req.params.tripId) }
    });
    res.json(bookings);
};