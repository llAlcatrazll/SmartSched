const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

// POST /api/update-status/:id
router.post('/:id', async (req, res) => {
    const bookingId = req.params.id;
    const { status } = req.body;

    const allowedStatuses = ['active', 'pending', 'declined', 'rescheduled', 'approved'];

    if (!allowedStatuses.includes(status.toLowerCase())) {
        return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    try {
        const result = await pool.query(
            `UPDATE "Booking" SET status = $1 WHERE id = $2 RETURNING *`,
            [status.toLowerCase(), bookingId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        res.json({ success: true, booking: result.rows[0], message: 'Status updated successfully' });
    } catch (err) {
        console.error('Update status error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
