// server/routes/dashboard/recentVehicleTransactions.js
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
            SELECT requestor AS user,
                   "vehicle_Type" AS resource,
                   TO_CHAR(date, 'YYYY-MM-DD') AS date,
                   status
            FROM "VehicleBooking"
            ORDER BY date DESC
            LIMIT 8
        `);
        res.json(result.rows);
    } catch (err) {
        console.error('Recent vehicle fetch error:', err);
        res.status(500).json({ message: 'Error fetching recent vehicle transactions' });
    }
});

module.exports = router;
