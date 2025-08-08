const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

// PUT /api/update-equipment-model/:id
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { model_id } = req.body;

    if (!model_id) {
        return res.status(400).json({ success: false, message: 'Model ID is required' });
    }

    try {
        const result = await pool.query(
            `UPDATE "Equipment" SET model_id = $1 WHERE id = $2 RETURNING *`,
            [model_id, id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: 'Equipment not found' });
        }

        res.json({ success: true, message: 'Model ID updated successfully', equipment: result.rows[0] });
    } catch (err) {
        console.error('Update equipment error:', err);
        res.status(500).json({ success: false, message: 'Failed to update model ID', error: err.message });
    }
});

module.exports = router;
