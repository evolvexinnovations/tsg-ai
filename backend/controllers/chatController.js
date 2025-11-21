// backend/controllers/chatController.js
import { getAIResponse } from "../services/aiService.js";
import { ProjectModel } from "../models/projectModel.js";
import { ChatModel } from "../models/chatModel.js";
import { MessageModel } from "../models/messageModel.js";

export const handleChat = async (req, res) => {
  try {
    const { projectId, chatId, message } = req.body;

    // 🆕 Ensure chat exists or create one
    let chat = chatId
      ? { id: chatId }
      : await ChatModel.create(projectId || null);

    // 💬 Save user message
    await MessageModel.add(chat.id, "user", message);

    // 🧠 Title first message
    const totalUserMsgs = await MessageModel.countUserMessages(chat.id);
    if (totalUserMsgs === 1) {
      const newTitle = message.split(" ").slice(0, 6).join(" ") + "...";
      await ChatModel.updateTitle(chat.id, newTitle);
    }

    // ⚙️ Get real AI response from OpenAI
    const aiReply = await getAIResponse(message);

    // 💾 Save assistant message
    await MessageModel.add(chat.id, "assistant", aiReply);

    // 📦 Return to frontend
    const messages = await MessageModel.findByChat(chat.id);

    res.json({
      chatId: chat.id,
      titleUpdated: totalUserMsgs === 1,
      messages,
      reply: aiReply,
    });
  } catch (err) {
    console.error("❌ Chat error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
