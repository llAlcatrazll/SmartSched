const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await pool.query(
            `UPDATE "User"
             SET deleted = true
             WHERE id = $1`,
            [id]
        );

        res.json({ success: true, message: 'User deleted (soft) successfully' });
    } catch (err) {
        console.error('Delete user error:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to delete user',
            error: err.message
        });
    }
});

module.exports = router;
