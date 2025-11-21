import express from "express";
import { handleChat } from "../controllers/chatController.js";
import { ProjectModel } from "../models/projectModel.js";
import { ChatModel } from "../models/chatModel.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

// All chat routes require authentication
router.use(authenticate);

// 🧠 Chat handler
router.post("/", handleChat);

// 📂 Get all projects
router.get("/projects", async (_req, res) => {
  const projects = await ProjectModel.findAll();
  res.json(projects);
});

// 💬 Get chats by project
router.get("/chats/:projectId", async (req, res) => {
  const chats = await ChatModel.findByProject(req.params.projectId);
  res.json(chats);
});

export default router;
