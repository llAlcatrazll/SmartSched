const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// PUT /api/delete-booking/:id
router.put('/:id', async (req, res) => {
    const bookingId = req.params.id;

    try {
        const result = await pool.query(
            `UPDATE "Booking"
             SET deleted = true
             WHERE id = $1`,
            [bookingId]
        );
        console.log('Delete this fcking booking');

        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        res.json({ success: true, message: 'Booking deleted (soft) successfully' });
    } catch (err) {
        console.error('Delete booking error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
