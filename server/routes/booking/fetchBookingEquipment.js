// routes/fetchEquipment.js
const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

// GET /api/equipment?booking_id=123
router.get('/', async (req, res) => {
    const { booking_id } = req.query;

    try {
        let result;
        if (booking_id) {
            // Fetch equipment for a specific booking
            result = await pool.query(
                `SELECT id, type, quantity, booking_id, model_id
                 FROM "Equipment"
                 WHERE booking_id = $1`,
                [booking_id]
            );
        } else {
            // Fetch all equipment if no booking_id is provided
            result = await pool.query(
                `SELECT id, type, quantity, booking_id, model_id
                 FROM "Equipment"`
            );
        }

        res.json({ success: true, equipment: result.rows });
    } catch (err) {
        console.error('Fetch equipment error:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch equipment',
            error: err.message
        });
    }
});

module.exports = router;
