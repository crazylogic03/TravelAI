const express = require("express")
const { signup, login } = require("../controllers/userController.js")
const jwt = require("jsonwebtoken");

const router = express.Router()

router.post("/signup", signup);
router.post("/login", login);

module.exports = router;