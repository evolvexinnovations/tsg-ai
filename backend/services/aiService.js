// backend/services/aiService.js
import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

// Read API key from environment (Lambda or local .env)
const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey || apiKey.trim() === "") {
  console.error("❌ ERROR: OPENAI_API_KEY is not set in environment variables");
} else {
  console.log("✅ OPENAI_API_KEY detected in environment (length:", apiKey.length, ")");
}

const client = new OpenAI({
  apiKey,
});

export const getAIResponse = async (prompt, model = "gpt-4o-mini", conversationHistory = []) => {
  try {
    // Validate API key before making request
    if (!apiKey || apiKey.trim() === "") {
      throw new Error("API key not configured in environment");
    }

    // Build messages array with system prompt and conversation history
    const messages = [
      {
        role: "system",
        content:
          "You are TSG AI — a helpful assistant for developers and managers. Keep responses concise and helpful.",
      },
    ];

    // Add conversation history if provided
    if (conversationHistory && conversationHistory.length > 0) {
      // Include recent messages for context (last 10 messages)
      const recentHistory = conversationHistory.slice(-10);
      messages.push(...recentHistory);
    } else {
      // If no history, just add the current user message
      messages.push({ role: "user", content: prompt });
    }

    // Ensure the last message is the current user prompt
    if (messages[messages.length - 1].role !== "user" || 
        messages[messages.length - 1].content !== prompt) {
      messages.push({ role: "user", content: prompt });
    }

    const completion = await client.chat.completions.create({
      model: model || "gpt-4o-mini", // Default to gpt-4o-mini if not specified
      messages: messages,
      temperature: 0.7,
      max_tokens: 800,
    });

    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error("OpenAI Error:", {
      message: error.message,
      status: error.status,
      type: error.type,
    });

    // Provide helpful error messages
    if (error.message?.includes("API key") || error.status === 401) {
      if (!apiKey || apiKey.trim() === "") {
        return "⚠️ OpenAI API key is not configured in the server environment. Ensure OPENAI_API_KEY is set in Lambda env variables.";
      }
      return "⚠️ OpenAI API key appears invalid or unauthorized. Please update the OPENAI_API_KEY secret and redeploy.";
    }
    
    if (error.message?.includes("rate limit")) {
      return "⚠️ Rate limit exceeded. Please try again in a moment.";
    }
    
    return `⚠️ Sorry, I couldn't process that request. ${error.message || "Unknown error"}`;
  }
};
