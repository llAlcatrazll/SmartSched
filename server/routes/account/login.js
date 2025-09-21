const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const jwt = require("jsonwebtoken");
const fetch = require("node-fetch");

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

const BOT_API = process.env.BOT_API;

router.post('/', async (req, res) => {
    const { email, password } = req.body;
    console.log("[LOGIN ROUTE] Body:", req.body);
    console.log(">>> [LOGIN ROUTE HIT]");
    console.log("Body received:", req.body);

    console.log("Parsed email:", email);
    console.log("Parsed password:", password);
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
        let checkData = { allowed: false };
        try {
            const checkRes = await fetch(`${BOT_API}/check-access`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: user.id })
            });

            if (!checkRes.ok) {
                console.error("Bot API returned error:", checkRes.status, await checkRes.text());
                return res.status(500).json({ success: false, message: "Bot API error" });
            }

            checkData = await checkRes.json();
        } catch (err) {
            console.error("Error contacting Bot API:", err);
            return res.status(500).json({ success: false, message: "Bot API unreachable" });
        }

        if (!checkData.allowed) {
            // 🚫 Log disabled login but do not throw
            try {
                await fetch(`${BOT_API}/log-login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        userId: user.id,
                        userName: user.name,
                        disabled: true
                    })
                });
            } catch (err) {
                console.error("Failed to log disabled login:", err);
            }

            return res.status(403).json({ success: false, message: "Access disabled by admin" });
        }


        // ✅ Generate JWT
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET || "supersecret",
            { expiresIn: "1h" }
        );

        // ✅ Log successful login
        try {
            await fetch(`${BOT_API}/log-login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: user.id,
                    userName: user.name,
                    disabled: false
                })
            });
        } catch (err) {
            console.error("Failed to log successful login:", err);
        }

        return res.json({
            success: true,
            user: { id: user.id, role: user.role },
            token
        });

    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
