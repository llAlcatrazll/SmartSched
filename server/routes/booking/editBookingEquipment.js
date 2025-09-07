const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

// PUT /api/edit-booking-equipment/:bookingId
router.put('/:bookingId', async (req, res) => {
    const { equipment = [], deletedIds = [] } = req.body;
    const { bookingId } = req.params;

    try {
        console.log('equipment:', equipment);
        console.log('deletedIds:', deletedIds);

        // Ensure deletedIds are integers
        const deletedIdsInt = deletedIds.map(Number).filter(Boolean);

        if (deletedIdsInt.length > 0) {
            await pool.query(
                `DELETE FROM "Equipment" WHERE booking_id = $1 AND id = ANY($2::int[])`,
                [bookingId, deletedIdsInt]
            );
        }

        for (const eq of equipment) {
            if (!eq.type || !eq.quantity) continue;
            if (eq.id) {
                await pool.query(
                    `UPDATE "Equipment"
                     SET type = $1, quantity = $2, model_id = $3
                     WHERE booking_id = $4 AND id = $5`,
                    [eq.type, eq.quantity, eq.model_id || null, bookingId, eq.id]
                );
            } else {
                await pool.query(
                    `INSERT INTO "Equipment" (type, quantity, booking_id, model_id)
                     VALUES ($1, $2, $3, $4)`,
                    [eq.type, eq.quantity, bookingId, eq.model_id || null]
                );
            }
        }

        res.json({ success: true, message: 'Equipment updated successfully' });
    } catch (err) {
        console.error('Edit booking equipment error:', err);
        res.status(500).json({ success: false, message: err.message || 'Server error' });
    }
});

module.exports = router;
