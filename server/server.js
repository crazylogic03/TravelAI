const express = require('express')
const cors = require("cors");

const userRoutes = require("./routes/userRoutes.js");


const app = express()


app.use(express.json())

app.use("/api/users", userRoutes);

app.listen(() => {
    console.log(`Server running on http://localhost:3000`)
})