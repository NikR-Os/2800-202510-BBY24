const express = require("express");
const axios = require("axios");
require("dotenv").config({ path: __dirname + '/../.env' });

const router = express.Router();

router.post("/motivate", async (req, res) => {
    const { topic } = req.body;
    console.log("[/motivate] Topic received:", topic);
    console.log("[/motivate] HuggingFace API Key present:", !!process.env.HUGGINGFACE_API_KEY);

    console.log("[ai.js] Entering try block");
    try {

        const prompt = `Give me one motivational quote to help me study ${topic}. Respond with a single sentence, 15 words or fewer.`;

        console.log("[ai.js] About to make axios.post call");
        const response = await axios.post(
            'https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta',
            {
                inputs: prompt,
                parameters: {
                    max_new_tokens: 50,
                    return_full_text: false
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`
                }
            }
        );

const aiMessage = (response.data[0]?.generated_text || "Stay strong. Keep going.").trim();

let limitedMessage = aiMessage;

// If the response has multiple quotes, pick the first clean one
const quotes = aiMessage.match(/"([^"]+)"/g);
if (quotes && quotes.length > 0) {
  limitedMessage = quotes[0].replace(/"/g, '');
}

console.log("[/motivate] Final trimmed quote:", limitedMessage);
res.json({ message: limitedMessage });




    } catch (err) {
        console.error("[/motivate] Hugging Face API error:", err);
        res.status(500).json({ error: "Failed to get motivation from Hugging Face" });
    }
});

module.exports = router;
