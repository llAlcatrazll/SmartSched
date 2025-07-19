const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

// Corrected Equipment Route
router.post('/', async (req, res) => {
    const { type, quantity, booking_id } = req.body;
    try {
        await pool.query(`
            INSERT INTO "Equipment" (type, quantity, booking_id)
            VALUES ($1, $2, $3)
        `, [type, quantity, booking_id]);

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.json({ success: false, error: 'Failed to create equipment' });
    }
});



module.exports = router;
