const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

// GET /api/fetch-bookings
router.get('/', async (req, res) => {
    try {
        // Table name should match createBooking.js: "Booking" (with quotes for case sensitivity)
        const result = await pool.query('SELECT * FROM "Booking" ORDER BY event_date DESC, starting_time DESC');
        res.json({ success: true, bookings: result.rows });
    } catch (err) {
        console.error('Fetch bookings error:', err); // Log the error for debugging
        res.status(500).json({ success: false, message: 'Failed to fetch bookings', error: err.message });
    }
});

module.exports = router;