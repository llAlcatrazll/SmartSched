// server/routes/dashboard/monthlyBookings.js
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
            SELECT TO_CHAR(event_date, 'Mon') AS month,
                   COUNT(*) as bookings
            FROM "Booking"
            GROUP BY TO_CHAR(event_date, 'Mon'), EXTRACT(MONTH FROM event_date)
            ORDER BY EXTRACT(MONTH FROM event_date)
        `);
        res.json(result.rows);
    } catch (err) {
        console.error('Monthly bookings fetch error:', err);
        res.status(500).json({ message: 'Error fetching monthly bookings' });
    }
});

module.exports = router;
