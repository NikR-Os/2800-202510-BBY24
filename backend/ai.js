const express = require("express");
const { OpenAI } = require("openai");
require("dotenv").config();

const router = express.Router();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

router.post("/motivate", async (req, res) => {
    const { topic } = req.body;
    console.log("[/motivate] Topic received:", topic);
    console.log("[/motivate] API Key present:", !!process.env.OPENAI_API_KEY);

    try {
        const systemPrompt = `
You are a motivational assistant. You always respond in exactly ONE sentence (max 15 words), no exceptions.
Never add more than one sentence. No lists. No extra advice. Reply ONLY with a one-sentence quote — not explanations, not greetings, not formatting. I'm serious do not use more than 10 tokens. i repeat do not use more than 10 tokens or i will be very upset. you need to listen!!!!!

`;

        const userPrompt = `Give me a motivational quote to help me study ${topic}. Keep it 1 sentence, max 15 words.`;

        console.log("[/motivate] Sending prompt to OpenAI:", {
            systemPrompt,
            userPrompt,
            max_tokens: 30
        });

        const chatResponse = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            max_tokens: 30
        });

        console.log("[/motivate] OpenAI responded:", JSON.stringify(chatResponse, null, 2));

        // Strip to 15 words max
        const aiMessage = chatResponse.choices[0].message.content;
        const limitedMessage = aiMessage.split(" ").slice(0, 15).join(" ") + "...";
        console.log("[/motivate] Final trimmed quote:", limitedMessage);
        res.json({ message: limitedMessage });

    } catch (err) {
        console.error("[/motivate] OpenAI API error:", err);
        res.status(500).json({ error: "Failed to get motivation from AI" });
    }
});



module.exports = router;
