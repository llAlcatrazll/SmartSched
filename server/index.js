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

app.get('/api/test', async (req, res) => {
    const result = await pool.query('SELECT NOW()');
    res.json(result.rows[0]);
    console.log("object");
});

const loginRoute = require('./routes/account/login');
const fetchUserRoute = require('./routes/account/fetchUserDetails');
// 
const createBookingRoute = require('./routes/booking/createBooking');
const deleteBookingRoute = require('./routes/booking/deleteBooking');
const fetchBookingRoute = require('./routes/booking/fetchBooking');
const editBookingRoute = require('./routes/booking/editBooking');
// const fetchVehiclesRoute = require('./routes/booking/fetchVehicles');
const vehicleBookingRoute = require('./routes/booking/createVehicleBooking');
const fetchVehicleBookingRoute = require('./routes/booking/fetchVehicleBooking');
const createequipmentRoute = require('./routes/booking/createequipment');
const updateBookingStatusRoute = require('./routes/booking/updateBookingStatus');

app.use('/api/login', loginRoute);
app.use('/api/fetch-user', fetchUserRoute);
// CREATE
app.use('/api/create-booking', createBookingRoute);
app.use('/api/vehicle-booking', vehicleBookingRoute);
app.use('/api/create-equipment', createequipmentRoute);
// UPDATE
app.use('/api/update-booking-status', updateBookingStatusRoute);
// DELETE
app.use('/api/delete-booking', deleteBookingRoute);
// FETCH
app.use('/api/fetch-bookings', fetchBookingRoute);
app.use('/api/fetch-vehicles', fetchVehicleBookingRoute);
// EDIT
app.use('/api/edit-booking', editBookingRoute);

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
