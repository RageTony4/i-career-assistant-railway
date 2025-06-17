const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // To parse JSON bodies from requests
app.use(express.static(path.join(__dirname, 'public'))); // Serve the static index.html file

// The secure API endpoint
app.post('/api/ai_analysis', async (req, res) => {
    try {
        const { prompt, model } = req.body;
        const apiKey = process.env.OPENROUTER_API_KEY;

        if (!apiKey) {
            throw new Error("The API key is not configured on the server.");
        }

        const openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: model,
                messages: [{ role: "user", content: prompt }]
            })
        });

        if (!openRouterResponse.ok) {
            const errorData = await openRouterResponse.json();
            throw new Error(errorData.error.message || `OpenRouter API request failed with status ${openRouterResponse.status}`);
        }

        const data = await openRouterResponse.json();
        res.json(data); // Send the successful response back to the frontend

    } catch (error) {
        console.error("Error in /api/ai_analysis:", error.message);
        res.status(500).json({ error: error.message });
    }
});

// Catch-all to serve the main page for any other route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
