const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

router.put('/:id', async (req, res) => {
    const {
        event_date,
        starting_time,
        ending_time,
        event_name,
        event_facility,
        requested_by,
        organization,
        contact
    } = req.body;

    const { id } = req.params;

    try {
        await pool.query(
            `UPDATE "Booking"
             SET event_date = $1, starting_time = $2, ending_time = $3, event_name = $4, 
                 event_facility = $5, requested_by = $6, organization = $7, contact = $8
             WHERE id = $9`,
            [event_date, starting_time, ending_time, event_name, event_facility, requested_by, organization, contact, id]
        );
        res.json({ success: true, message: 'Booking updated successfully' });
    } catch (err) {
        console.error('Edit booking error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
