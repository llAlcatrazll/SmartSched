const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// PUT /api/cancel-Booking/:id
router.put('/:id', async (req, res) => {
    const bookingId = req.params.id;

    try {
        const result = await pool.query(
            `DELETE FROM "Booking"
     WHERE id = $1`,
            [bookingId]
        );

        console.log('This booking is Cancelled');

        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        res.json({ success: true, message: 'Booking cancelled successfully' });
    } catch (err) {
        console.error('Cancel booking error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
