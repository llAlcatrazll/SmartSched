// server/routes/dashboard/collegeBookings.js
const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

router.get('/', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT organization AS college,
                   COUNT(*) as bookings
            FROM "Booking"
            GROUP BY organization
            ORDER BY bookings DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error('College bookings fetch error:', err);
        res.status(500).json({ message: 'Error fetching college bookings' });
    }
});

module.exports = router;
