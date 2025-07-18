const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

router.get('/', async (req, res) => {
    try {
        // vehicle booking
        const result = await pool.query('SELECT * FROM "VehicleBooking" ORDER BY date DESC');
        res.json({ success: true, bookings: result.rows });
    } catch (err) {
        console.error('Fetch bookings error:', err); // Log the error for debugging
        res.status(500).json({ success: false, message: 'Failed to fetch vehicle bookings', error: err.message });
    }
});

module.exports = router;