import { pool } from "../db/connection.js";

export const ProjectModel = {
  async create(name, description = "") {
    const res = await pool.query(
      "INSERT INTO projects (name, description) VALUES ($1, $2) RETURNING *",
      [name, description]
    );
    return res.rows[0];
  },
  async findAll() {
    const res = await pool.query("SELECT * FROM projects ORDER BY created_at DESC");
    return res.rows;
  },
};
