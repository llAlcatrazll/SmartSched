const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

// CREATE vehicle booking
router.post('/', async (req, res) => {
    const { vehicleType, requestor, department, date, purpose } = req.body;

    try {
        const { vehicleType, requestor, department, date, purpose, booker_id, deleted } = req.body;

        await pool.query(
            `INSERT INTO "VehicleBooking" 
    ("vehicle_Type", requestor, department, date, purpose, booker_id, deleted)
    VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [vehicleType, requestor, department, date, purpose, booker_id, false]
        );

        res.json({ success: true, message: 'Vehicle booking created successfully' });
    } catch (err) {
        console.error('Create vehicle booking error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
