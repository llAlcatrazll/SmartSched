const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, plateNumber, vin, type, capacity } = req.body;

    try {
        const result = await pool.query(
            `UPDATE "Vehicles"
             SET vehicle_name = $1,
                 plate_number = $2,
                 vin = $3,
                 vehicle_type = $4,
                 passenger_capacity = $5
             WHERE id = $6
             RETURNING id,
                       vehicle_name,
                       plate_number,
                       vin,
                       vehicle_type,
                       passenger_capacity`,
            [name, plateNumber, vin, type, capacity, id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle not found'
            });
        }

        res.json({
            success: true,
            vehicle: result.rows[0],
            message: 'Vehicle updated'
        });
    } catch (err) {
        console.error('Update vehicle error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
