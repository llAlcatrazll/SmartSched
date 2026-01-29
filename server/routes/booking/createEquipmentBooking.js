const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

// Use your DATABASE_URL
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

/**
 * POST /api/create-equipment-booking
 * Body: {
 *   equipments: [{ equipmentId: string, quantity: number }],
 *   departmentId: string,
 *   facilityId: string,
 *   purpose: string,
 *   mode: string,
 *   date: string,
 *   specificDates: array of strings (YYYY-MM-DD),
 *   rangeStart: string (YYYY-MM-DD),
 *   rangeEnd: string (YYYY-MM-DD),
 *   timeStart: string,
 *   timeEnd: string
 * }
 */
router.post('/', async (req, res) => {
    const {
        equipments,
        departmentId,
        facilityId,
        purpose,
        mode,
        date,
        specificDates,
        rangeStart,
        rangeEnd,
        timeStart,
        timeEnd
    } = req.body;

    // Validate required fields
    if (!equipments || !departmentId || !facilityId || !purpose || !mode || !timeStart || !timeEnd) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Validate and construct dates array based on mode
    let datesArray = [];
    if (mode === 'single' && date) {
        datesArray.push(date);
    } else if (mode === 'specific' && specificDates && specificDates.length > 0) {
        datesArray = specificDates;
    } else if (mode === 'range' && rangeStart && rangeEnd) {
        const start = new Date(rangeStart);
        const end = new Date(rangeEnd);
        if (start > end) {
            return res.status(400).json({ success: false, message: 'Invalid date range' });
        }
        for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
            datesArray.push(d.toISOString().split('T')[0]);
        }
    } else {
        return res.status(400).json({ success: false, message: 'Invalid date or mode' });
    }

    try {
        // Insert each equipment booking into the database
        for (const eq of equipments) {
            await pool.query(
                `INSERT INTO "Equipment" (
                    equipment_type_id, quantity, affiliation_id, facility_id, dates, purpose, created_at
                ) VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
                [eq.equipmentId, eq.quantity, departmentId, facilityId, datesArray, purpose]
            );
        }

        res.json({
            success: true,
            message: 'Equipment booking created successfully'
        });
    } catch (err) {
        console.error('Create Equipment Booking error:', err);
        res.status(500).json({ success: false, message: 'Failed to create equipment booking', error: err.message });
    }
});

module.exports = router;
