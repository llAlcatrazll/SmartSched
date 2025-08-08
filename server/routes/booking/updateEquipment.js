const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

// PUT /api/update-equipment/:id
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { type, quantity, model_id } = req.body;

    if (!type || !quantity || !model_id) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    try {
        const result = await pool.query(
            `UPDATE "Equipment"
             SET type = $1, quantity = $2, model_id = $3
             WHERE id = $4 RETURNING *`,
            [type, quantity, model_id, id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: 'Equipment not found' });
        }

        res.json({ success: true, message: 'Equipment updated successfully', equipment: result.rows[0] });
    } catch (err) {
        console.error('Update equipment error:', err);
        res.status(500).json({ success: false, message: 'Failed to update equipment', error: err.message });
    }
});

module.exports = router;
