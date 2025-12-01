import React, { useContext, useState, useEffect } from "react";
import {
  Box,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Typography,
  Tooltip,
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { ChatContext } from "../context/chatcontext";

export default function Sidebar() {
  const {
    currentChat,
    startNewChat,
    switchChat,
    deleteChat,
    createProject,
    projects,
    getChatsByProject,
    currentProject,
    setCurrentProject,
  } = useContext(ChatContext);

  const [selectedProject, setSelectedProject] = useState(currentProject);
  useEffect(() => setSelectedProject(currentProject), [currentProject]);

  const handleNewChat = () => startNewChat(selectedProject);
  const handleCreateProject = () => {
    const name = prompt("Enter new project name:");
    if (name) {
      const proj = createProject({ name });
      setSelectedProject(proj.id);
      alert(`✅ Project "${name}" created!`);
    }
  };

  const projectChats = getChatsByProject(selectedProject);

  return (
    <Box
      sx={{
        width: 260,
        height: "100vh",
        bgcolor: "linear-gradient(180deg, #0f2027, #1a2f33, #13282e)",
        color: "white",
        display: "flex",
        flexDirection: "column",
        p: 2,
        borderRight: "1px solid #1b3b45",
        boxShadow: "4px 0 10px rgba(0, 255, 255, 0.05)",
      }}
    >
      {/* 🟣 New Chat */}
      <Button
        fullWidth
        variant="contained"
        startIcon={<AddIcon />}
        onClick={handleNewChat}
        sx={{
          mb: 2,
          background: "linear-gradient(90deg, #0d9488, #14b8a6)",
          "&:hover": { background: "linear-gradient(90deg, #0f766e, #0d9488)" },
          textTransform: "none",
          fontWeight: 600,
          color: "#e0fdfa",
        }}
      >
        New Chat
      </Button>

      {/* 📁 Create Project */}
      <Button
        variant="outlined"
        startIcon={<FolderOpenIcon />}
        onClick={handleCreateProject}
        sx={{
          mb: 2,
          color: "#5eead4",
          borderColor: "#164e63",
          "&:hover": {
            borderColor: "#5eead4",
            backgroundColor: "rgba(45, 212, 191, 0.05)",
          },
          textTransform: "none",
        }}
      >
        Create Project
      </Button>

      {/* 🔽 Project Filter */}
      <select
        value={selectedProject || ""}
        onChange={(e) => {
          const val = e.target.value ? Number(e.target.value) : null;
          setSelectedProject(val);
          setCurrentProject(val);
        }}
        style={{
          background: "#0f2027",
          color: "#d1fae5",
          border: "1px solid #1b3b45",
          borderRadius: "6px",
          padding: "8px",
          marginBottom: "15px",
          outline: "none",
        }}
      >
        <option value="">All Projects</option>
        {projects.map((proj) => (
          <option key={proj.id} value={proj.id}>
            {proj.name}
          </option>
        ))}
      </select>

      <Divider sx={{ borderColor: "#1b3b45", mb: 1 }} />
      <Typography
        variant="subtitle2"
        sx={{
          mb: 1,
          color: "#5eead4",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        Chat History
      </Typography>

      {/* 💬 Chats */}
      <List
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          "&::-webkit-scrollbar": { width: "6px" },
          "&::-webkit-scrollbar-thumb": {
            background: "#134e4a",
            borderRadius: "3px",
          },
        }}
      >
        {projectChats.length === 0 ? (
          <Typography
            variant="body2"
            sx={{ color: "#6b7280", textAlign: "center", mt: 3 }}
          >
            No chats yet. Start one!
          </Typography>
        ) : (
          projectChats.map((chat) => {
            const project = projects.find((p) => p.id === chat.projectId);
            const projectLabel = project
              ? `Project: ${project.name}`
              : "Project: None";

            return (
              <ListItem
                key={chat.id}
                disablePadding
                sx={{
                  mb: 0.5,
                  borderRadius: "6px",
                  bgcolor:
                    chat.id === currentChat
                      ? "rgba(45, 212, 191, 0.15)"
                      : "transparent",
                }}
              >
                <ListItemButton onClick={() => switchChat(chat.id)}>
                  <ListItemText
                    primary={
                      <Typography
                        sx={{
                          color:
                            chat.id === currentChat ? "#5eead4" : "#e5e7eb",
                          fontSize: "0.9rem",
                          fontWeight:
                            chat.id === currentChat ? "bold" : "normal",
                        }}
                      >
                        {chat.title}
                      </Typography>
                    }
                    secondary={
                      <Typography
                        sx={{
                          color: "#9ca3af",
                          fontSize: "0.75rem",
                          mt: 0.5,
                        }}
                        noWrap
                      >
                        {projectLabel}
                      </Typography>
                    }
                  />
                  <Tooltip title="Delete chat">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm("Delete this chat?"))
                          deleteChat(chat.id);
                      }}
                      sx={{
                        color: "#14b8a6",
                        ml: 1,
                        "&:hover": {
                          color: "#5eead4",
                          transform: "scale(1.15)",
                        },
                        transition: "all 0.2s ease",
                      }}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </ListItemButton>
              </ListItem>
            );
          })
        )}
      </List>

      <Divider sx={{ borderColor: "#1b3b45", mt: 1, mb: 1 }} />
      <Typography
        variant="caption"
        sx={{
          textAlign: "center",
          color: "#5eead4",
          mt: 1,
          fontSize: "0.7rem",
        }}
      >
        v1.0 © TSG AI
      </Typography>
    </Box>
  );
}
