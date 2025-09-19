const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

// GET /api/vehicle-conflicts?vehicleType=Innova&date=2025-09-30
router.get('/', async (req, res) => {
    const { vehicleType, date } = req.query;
    if (!vehicleType || !date) {
        return res.status(400).json({ success: false, message: 'vehicleType and date are required' });
    }

    try {
        const result = await pool.query(
            `SELECT * FROM "VehicleBooking"
             WHERE "vehicle_Type" = $1
               AND date = $2
               AND deleted = false
             ORDER BY date DESC`,
            [vehicleType, date]
        );

        res.json({ success: true, bookings: result.rows });
    } catch (err) {
        console.error('Fetch vehicle conflicts error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch vehicle bookings', error: err.message });
    }
});

module.exports = router;
