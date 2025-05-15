const express = require("express");
const { OpenAI } = require("openai");
require("dotenv").config();

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

router.post("/motivate", async (req, res) => {
  const { topic } = req.body;

  try {
    const chatResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a motivational assistant that helps students stay focused and inspired to study."
        },
        {
          role: "user",
          content: `I need motivation to study ${topic}. Can you help?`
        }
      ]
    });

    const aiMessage = chatResponse.choices[0].message.content;
    res.json({ message: aiMessage });
  } catch (err) {
    console.error("OpenAI API error:", err.message);
    res.status(500).json({ error: "Failed to get motivation from AI" });
  }
});

module.exports = router;
