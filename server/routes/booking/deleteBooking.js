const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

router.put('/:id', async (req, res) => {
    // const { id } = req.params;
    const bookingId = req.params.id;

    try {
        const result = await pool.query(
            `UPDATE "Booking"
             SET deleted = true
             WHERE id = $1`,
            [bookingId]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }
        // console.log('PATCH booking id:', id);
        // await pool.query(`UPDATE "Booking" SET status = 'deleted' WHERE id = $1`, [id]);
        res.json({ success: true, message: 'Facility booking deleted (soft) successfully' });
    } catch (err) {
        console.error('Soft delete booking error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});




module.exports = router;
