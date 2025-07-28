const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

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

        res.json({ success: true, user: { id: user.id, role: user.role } });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
