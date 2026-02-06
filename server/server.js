require("dotenv").config();
const express = require("express");
const cors = require("cors");

const userRoutes = require("./routes/userRoutes");
const tripRoutes = require("./routes/tripRoutes");
// const aiRoutes = require("./routes/aiRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
// const paymentRoutes = require("./routes/paymentRoutes");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/v11/auth", userRoutes);
app.use("/api/v11/trips", tripRoutes);
// app.use("/api/v11/ai", aiRoutes);
app.use("/api/v11/bookings", bookingRoutes);
// app.use("/api/v11/payments", paymentRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
    console.log(`🚀 Server running on port ${PORT}`)
);