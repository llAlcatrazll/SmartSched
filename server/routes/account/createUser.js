const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
// require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

router.post('/', async (req, res) => {
    const { name, affiliation, role, email, password } = req.body;

    try {
        await pool.query(
            `INSERT INTO "User" (name, affiliation, role, email, password, deleted)
             VALUES ($1, $2, $3, $4, $5, false)`,
            [name, affiliation, role, email, password]
        );

        res.json({ success: true, message: 'User created successfully' });
    } catch (err) {
        console.error('Create user error:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to create user',
            error: err.message
        });
    }
});

module.exports = router;
