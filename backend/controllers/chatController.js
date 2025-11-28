// backend/controllers/chatController.js
import { getAIResponse } from "../services/aiService.js";
import { ProjectModel } from "../models/projectModel.js";
import { ChatModel } from "../models/chatModel.js";
import { MessageModel } from "../models/messageModel.js";

export const handleChat = async (req, res) => {
  try {
    const { projectId, chatId, message, model, conversationHistory } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // ⚙️ Get real AI response from OpenAI (primary functionality)
    let aiReply;
    try {
      aiReply = await getAIResponse(message, model, conversationHistory);
    } catch (aiError) {
      console.error("❌ AI service error:", aiError);
      return res.status(500).json({ 
        error: aiError.message || "Failed to get AI response. Please check OpenAI API key configuration." 
      });
    }

    // Try to save to database if chatId is provided (optional - frontend uses localStorage)
    let savedChatId = chatId;
    try {
      if (chatId) {
        // Try to save messages to database
        try {
          await MessageModel.add(chatId, "user", message);
          await MessageModel.add(chatId, "assistant", aiReply);
        } catch (dbError) {
          console.warn("⚠️ Database save failed (using localStorage fallback):", dbError.message);
        }
      } else if (projectId) {
        // Try to create new chat in database
        try {
          const chat = await ChatModel.create(projectId);
          savedChatId = chat.id;
          await MessageModel.add(chat.id, "user", message);
          await MessageModel.add(chat.id, "assistant", aiReply);
        } catch (dbError) {
          console.warn("⚠️ Database create failed (using localStorage fallback):", dbError.message);
        }
      }
    } catch (dbError) {
      // Database operations are optional - frontend handles localStorage
      console.warn("⚠️ Database operations failed, but AI response succeeded:", dbError.message);
    }

    // 📦 Return to frontend (always return AI response even if DB operations failed)
    res.json({
      chatId: savedChatId || chatId || null,
      reply: aiReply,
      success: true,
    });
  } catch (err) {
    console.error("❌ Chat error:", err);
    res.status(500).json({ error: err.message || "Internal server error" });
  }
};
