const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

// DELETE /api/delete-equipment/:id
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(`DELETE FROM "Equipment" WHERE id = $1 RETURNING *`, [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: 'Equipment not found' });
        }
        res.json({ success: true, message: 'Equipment deleted successfully' });
    } catch (err) {
        console.error('Delete equipment error:', err);
        res.status(500).json({ success: false, message: 'Failed to delete equipment', error: err.message });
    }
});

module.exports = router;
