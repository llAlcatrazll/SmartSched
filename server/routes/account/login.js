// routes/login.js
const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const jwt = require("jsonwebtoken");
const fetch = require("node-fetch"); // make sure to install: npm install node-fetch

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

// Bot API URL
const BOT_API = "http://localhost:5001";

router.post('/', async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await pool.query(
            `SELECT id, name, role, password FROM "User" WHERE email = $1`,
            [email]
        );

        if (result.rowCount === 0) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const user = result.rows[0];

        if (user.password !== password) {
            return res.status(401).json({ success: false, message: 'Incorrect password' });
        }

        // ✅ Check access with bot
        const checkRes = await fetch(`${BOT_API}/check-access`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user.id })
        });
        const checkData = await checkRes.json();

        if (!checkData.allowed) {
            // 🚫 Send log to bot
            await fetch(`${BOT_API}/log-login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: user.id,
                    userName: user.name,
                    disabled: true
                })
            });

            return res.status(403).json({ success: false, message: "Access disabled by admin" });
        }

        // ✅ Generate a JWT
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET || "supersecret", // keep in .env
            { expiresIn: "1h" }
        );

        // ✅ Send log to bot for successful login
        await fetch(`${BOT_API}/log-login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId: user.id,
                userName: user.name,
                disabled: false
            })
        });

        res.json({
            success: true,
            user: { id: user.id, role: user.role },
            token
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
