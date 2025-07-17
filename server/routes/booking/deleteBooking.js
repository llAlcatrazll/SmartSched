const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

router.patch('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        console.log('PATCH booking id:', id);
        await pool.query(`UPDATE "Booking" SET status = 'deleted' WHERE id = $1`, [id]);
        res.json({ success: true, message: 'Booking marked as deleted' });
    } catch (err) {
        console.error('Soft delete booking error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});




module.exports = router;
