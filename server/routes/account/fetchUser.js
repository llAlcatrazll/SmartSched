const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

// Fetch all users (non-deleted)
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, name, affiliation, role, email 
             FROM "User" WHERE deleted = false ORDER BY id ASC`
        );
        res.json({ success: true, users: result.rows }); // wrap in an object
    } catch (err) {
        console.error('Fetch users error:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch users',
            error: err.message
        });
    }
});


// Fetch a single user by ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            `SELECT id, name, affiliation, role, email 
             FROM "User" WHERE id = $1 AND deleted = false`,
            [id]
        );

        if (result.rows.length > 0) {
            res.json({ success: true, user: result.rows[0] });
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (err) {
        console.error('Fetch user error:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user',
            error: err.message
        });
    }
});

module.exports = router;
