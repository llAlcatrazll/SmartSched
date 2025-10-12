const express = require('express');
const router = express.Router();
const axios = require('axios');
require('dotenv').config();

router.post('/', async (req, res) => {
    const { message, bookings = {}, currentDateTime } = req.body;

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
You are a helpful assistant for a facility and vehicle booking system.

The current date and time is: ${currentDateTime}

You can both answer questions AND create new bookings.

If the user requests to "make a booking", respond ONLY with JSON data using this format:
{
  "intent": "create_booking",
  "event_name": "<string>",
  "event_date": "<YYYY-MM-DD>",
  "starting_time": "<HH:MM>",
  "ending_time": "<HH:MM>",
  "event_facility": "<string>",
  "requested_by": "<string>",
  "organization": "<string>",
  "contact": "<string>"
}

Otherwise, respond normally in Markdown.
Here are current bookings:
${formattedResponse}
`;

    try {
        // 🧠 Send to Cohere
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

        const aiReply = cohereResponse.data.text?.trim() || "";
        console.log("🤖 AI raw reply:", aiReply);

        // Try to detect JSON in AI response
        const jsonMatch = aiReply.match(/\{[\s\S]*\}/);
        let bookingData = null;
        if (jsonMatch) {
            try {
                bookingData = JSON.parse(jsonMatch[0]);
            } catch (err) {
                console.warn("⚠️ JSON parse failed:", err.message);
            }
        }

        // 🚀 If it's a booking intent, post to backend
        // ✅ Handle booking creation intent
        if (bookingData?.intent === "create_booking") {
            console.log("📦 Creating booking:", bookingData);

            // Validate required fields before posting
            const requiredFields = [
                "event_name",
                "event_date",
                "starting_time",
                "ending_time",
                "event_facility",
                "requested_by",
                "organization",
                "contact"
            ];

            const missingFields = requiredFields.filter(field => !bookingData[field]);

            if (missingFields.length > 0) {
                console.warn("⚠️ Missing booking fields:", missingFields);
                return res.json({
                    reply: `I still need the following details before creating your booking:\n\n${missingFields
                        .map(f => `- ${f.replace(/_/g, " ")}`)
                        .join("\n")}\n\nPlease provide them to continue.`
                });
            }

            const backendURL = `${process.env.BASE_URL || "http://localhost:5000"}/api/create-booking`;

            try {
                const response = await axios.post(backendURL, {
                    event_name: bookingData.event_name,
                    event_date: bookingData.event_date,
                    starting_time: bookingData.starting_time,
                    ending_time: bookingData.ending_time,
                    event_facility: bookingData.event_facility,
                    requested_by: bookingData.requested_by,
                    organization: bookingData.organization,
                    contact: bookingData.contact,
                    creator_id: 1
                });

                console.log("✅ Booking created successfully:", response.data);
                return res.json({
                    reply: `✅ Booking created successfully!\n\n**Event:** ${bookingData.event_name}\n**Date:** ${bookingData.event_date}\n**Time:** ${bookingData.starting_time}–${bookingData.ending_time}\n**Facility:** ${bookingData.event_facility}`,
                    result: response.data
                });
            } catch (err) {
                console.error("❌ Booking creation failed:", err.message);
                return res.json({
                    reply: "❌ Failed to create booking. Please try again later."
                });
            }
        }

        // 🧠 Otherwise just return AI’s reply normally
        res.json({ reply: aiReply });

    } catch (error) {
        console.error('❌ Cohere API error:', error.message);
        res.status(500).json({ error: 'Failed to fetch reply from AI.' });
    }
});

module.exports = router;
