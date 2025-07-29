// server/routes/dashboard/recentFacilityTransactions.js
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
            SELECT requested_by AS user,
                   event_facility AS resource,
                   TO_CHAR(event_date, 'YYYY-MM-DD') AS date,
                   status
            FROM "Booking"
            ORDER BY event_date DESC, starting_time DESC
            LIMIT 8
        `);
        res.json(result.rows);
    } catch (err) {
        console.error('Recent facility fetch error:', err);
        res.status(500).json({ message: 'Error fetching recent facility transactions' });
    }
});

module.exports = router;
