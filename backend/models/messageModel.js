import { pool } from "../db/connection.js";

export const MessageModel = {
  async add(chatId, role, content) {
    await pool.query(
      "INSERT INTO messages (chat_id, role, content) VALUES ($1, $2, $3)",
      [chatId, role, content]
    );
  },
  async findByChat(chatId) {
    const res = await pool.query(
      "SELECT role, content, created_at FROM messages WHERE chat_id = $1 ORDER BY created_at ASC",
      [chatId]
    );
    return res.rows;
  },
  async countUserMessages(chatId) {
    const res = await pool.query(
      "SELECT COUNT(*)::int AS total FROM messages WHERE chat_id = $1 AND role = 'user'",
      [chatId]
    );
    return res.rows[0].total;
  },
};
