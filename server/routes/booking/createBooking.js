const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

router.post('/', async (req, res) => {
    const {
        event_date,
        starting_time,
        ending_time,
        event_name,
        event_facility,
        requested_by,
        organization,
        contact,
        creator_id
    } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO "Booking" 
            (event_date, starting_time, ending_time, event_name, event_facility, requested_by, organization, contact, creator_id, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9,'pending')
            RETURNING id`,
            [event_date, starting_time, ending_time, event_name, event_facility, requested_by, organization, contact, creator_id]
        );

        const bookingId = result.rows[0].id;

        res.json({ success: true, id: bookingId, message: 'Booking created successfully' });
    } catch (err) {
        console.error('Create booking error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});


module.exports = router;
