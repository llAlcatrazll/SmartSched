const express = require('express');
const router = express.Router();
const axios = require('axios');
require('dotenv').config();

router.post('/', async (req, res) => {
    const { message, bookings = {}, currentDateTime } = req.body;

    // Extract facilities and vehicles safely
    const facilityBookings = Array.isArray(bookings.facilities) ? bookings.facilities : [];
    const vehicleBookings = Array.isArray(bookings.vehicles) ? bookings.vehicles : [];

    // --- FORMAT FACILITY BOOKINGS ---
    const formattedFacilities = facilityBookings.map(b => {
        const [year, month, day] = (b.date || '').split('-');
        const dateObj = new Date(`${year}-${month}-${day}`);
        dateObj.setDate(dateObj.getDate() + 1);
        const newDate = dateObj.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
        });

        const formatTime = (time) => {
            if (!time) return "";
            const [h, m] = time.split(':');
            let hour = parseInt(h, 10);
            const ampm = hour >= 12 ? "PM" : "AM";
            hour = hour % 12 || 12;
            return `${hour}:${m} ${ampm}`;
        };

        return `- 📅 ${b.name} (${b.requestedBy}) at ${b.facility} on ${newDate} from ${formatTime(b.startTime)} to ${formatTime(b.endTime)}`;
    }).join('\n');

    // --- FORMAT VEHICLE BOOKINGS ---
    const formattedVehicles = vehicleBookings.map(v => {
        const [year, month, day] = (v.date || '').split('-');
        const dateObj = new Date(`${year}-${month}-${day}`);
        dateObj.setDate(dateObj.getDate() + 1);
        const newDate = dateObj.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
        });

        return `- 🚗 ${v.vehicle_Type} for ${v.purpose} on ${newDate} requested by ${v.requestor} (${v.department})`;
    }).join('\n');


    const formattedResponse = [
        formattedFacilities ? `### Facility Bookings\n${formattedFacilities}` : '',
        formattedVehicles ? `### Vehicle Bookings\n${formattedVehicles}` : ''
    ].filter(Boolean).join('\n\n');

    const systemPrompt = `
        You are a helpful assistant that answers questions about facility and vehicle bookings.
        The current date and time is: ${currentDateTime}

        Here is a list of all current bookings (in bullet points):
        ${formattedResponse}

        Guidelines:
        - Respond in Markdown format.
        - Each booking must be on its own line, starting with "-".
        - Never merge multiple bookings.
        - Keep answers concise.
    `;

    try {
        const cohereResponse = await axios.post(
            'https://api.cohere.ai/v1/chat',
            {
                message,
                chat_history: [
                    { role: "SYSTEM", message: systemPrompt },
                    { role: "USER", message }
                ],
                stream: false,
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.COHERE_API_KEY}`,
                    'Content-Type': 'application/json',
                }
            }
        );

        res.json({ reply: cohereResponse.data.text });
    } catch (error) {
        console.error('Cohere API error:', error.message);
        res.status(500).json({ error: 'Failed to fetch reply from AI.' });
    }
});

module.exports = router;
