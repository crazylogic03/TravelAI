const express = require("express")
const { PrismaClient } = require("@prisma/client");
const bcrypt = require('bcrypt')


const prisma = new PrismaClient()

exports.signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) return res.status(400).json({ message: "User already exists" });
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { name, email, password: hashedPassword },
        });
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || "supersecretkey", {
            expiresIn: "7d",
        });

        res.status(201).json({ message: "User created successfully", token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error during signup" });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(404).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password || "");
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET || "supersecretkey",
            { expiresIn: "7d" }
        );

        res.json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                profilePic: user.profilePic,
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error during login" });
    }
};
