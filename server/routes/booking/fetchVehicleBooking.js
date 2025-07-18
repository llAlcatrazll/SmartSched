// server/routes/booking/fetchVehicleBooking.js
const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

router.get('/', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT id, "vehicle_Type" AS "vehicleType", requestor, department, date, purpose
            FROM "VehicleBooking"
            ORDER BY date DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error('Fetch vehicle bookings error:', err);
        res.status(500).json({ message: 'Server error fetching vehicle bookings' });
    }
});

module.exports = router;
