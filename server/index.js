// server/index.js
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

app.use(cors());
app.use(express.json());

// Example route
app.get('/api/test', async (req, res) => {
    const result = await pool.query('SELECT NOW()');
    res.json(result.rows[0]);
    console.log("object");
});

const loginRoute = require('./routes/account/login');
const createBookingRoute = require('./routes/booking/createBooking');
const fetchBookingRoute = require('./routes/booking/fetchBooking');
const editBookingRoute = require('./routes/booking/editBooking');
const deleteBookingRoute = require('./routes/booking/deleteBooking');

app.use('/api/login', loginRoute);
app.use('/api/create-booking', createBookingRoute);
app.use('/api/fetch-bookings', fetchBookingRoute);
app.use('/api/edit-booking', editBookingRoute);
app.use('/api/delete-booking', deleteBookingRoute);

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
