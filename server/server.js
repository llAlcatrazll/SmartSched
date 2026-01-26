const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

router.get('/fetch-related-vehicle-bookings', async (req, res) => {
    const { booking_id } = req.query;

    if (!booking_id) {
        return res.status(400).json({ success: false, message: 'Booking ID is required' });
    }

    try {
        const result = await pool.query(
            `SELECT v.id, v.plate_number, v.vehicle_type, v.passenger_capacity
             FROM "Vehicles" v
             JOIN "Bookings_Vehicles" bv ON v.id = bv.vehicle_id
             WHERE bv.booking_id = $1`,
            [booking_id]
        );

        res.json({
            success: true,
            vehicles: result.rows
        });
    } catch (err) {
        console.error('Fetch related vehicle bookings error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;