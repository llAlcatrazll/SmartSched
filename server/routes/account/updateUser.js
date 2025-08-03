const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, affiliation, role, email, password } = req.body;

    try {
        if (password) {
            await pool.query(
                `UPDATE "User"
                 SET name = $1, affiliation = $2, role = $3, email = $4, password = $5
                 WHERE id = $6`,
                [name, affiliation, role, email, password, id]
            );
        } else {
            await pool.query(
                `UPDATE "User"
                 SET name = $1, affiliation = $2, role = $3, email = $4
                 WHERE id = $5`,
                [name, affiliation, role, email, id]
            );
        }

        res.json({ success: true, message: 'User updated successfully' });
    } catch (err) {
        console.error('Update user error:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to update user',
            error: err.message
        });
    }
});

module.exports = router;
