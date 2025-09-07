const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

// DELETE /api/delete-booking-equipment/:equipmentId
router.delete('/:equipmentId', async (req, res) => {
    const { equipmentId } = req.params;
    try {
        await pool.query(`DELETE FROM "Equipment" WHERE id = $1`, [equipmentId]);
        res.json({ success: true });
    } catch (err) {
        console.error('Delete equipment error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;