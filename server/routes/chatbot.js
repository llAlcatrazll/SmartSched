const express = require('express');
const router = express.Router();
const axios = require('axios');
require('dotenv').config();

router.post('/', async (req, res) => {
    const { message, bookings = [], currentDateTime } = req.body; // <-- add currentDateTime here

    const formattedBookings = bookings.map(b => {
        return `📅 ${b.title} at ${b.facility} on ${b.date} from ${b.startTime} to ${b.endTime}`;
    }).join('\n');

    const systemPrompt = `
You are a helpful assistant that answers questions about facility bookings.
The current date and time is: ${currentDateTime}

Here is a list of current bookings:\n\n${formattedBookings}\n\n
Now, answer the user's question below.
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
