import { pool } from "../db/connection.js";

export const ChatModel = {
  async create(projectId) {
    const res = await pool.query(
      "INSERT INTO chats (project_id) VALUES ($1) RETURNING *",
      [projectId]
    );
    return res.rows[0];
  },
  async updateTitle(chatId, title) {
    await pool.query("UPDATE chats SET title = $1 WHERE id = $2", [title, chatId]);
  },
  async findByProject(projectId) {
    const res = await pool.query(
      "SELECT * FROM chats WHERE project_id = $1 ORDER BY created_at DESC",
      [projectId]
    );
    return res.rows;
  },
};
