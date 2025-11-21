// backend/services/aiService.js
import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const getAIResponse = async (prompt) => {
  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini", // or "gpt-3.5-turbo" for cheaper tier
      messages: [
        {
          role: "system",
          content:
            "You are CorporateAI — a helpful assistant for developers and managers.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
    });

    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error("OpenAI Error:", error);
    return "⚠️ Sorry, I couldn’t process that request.";
  }
};
