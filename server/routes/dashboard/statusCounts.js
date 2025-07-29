// server/routes/dashboard/statusCounts.js
const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

// GET /api/dashboard/status-counts
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT status, COUNT(*) as count
            FROM "Booking"
            GROUP BY status
        `);
        res.json(result.rows);
    } catch (err) {
        console.error('Status count fetch error:', err);
        res.status(500).json({ message: 'Error fetching booking status counts' });
    }
});

module.exports = router;
