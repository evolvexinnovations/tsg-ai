import React, { createContext, useState, useEffect } from "react";
import axiosInstance from "../config/axios";

export const ChatContext = createContext();

const MODEL_CONFIG = {
  "TSG Model v1": {
    id: "gpt-3.5-turbo",
    desc: "Fast & default",
  },
  "TSG Plus": {
    id: "gpt-4o-mini",
    desc: "Balanced power",
  },
  "TSG Pro": {
    id: "gpt-4",
    desc: "Maximum reasoning",
  },
};
const MODEL_STORAGE_KEY = "corporate_ai_model";
const DEFAULT_MODEL = "TSG Model v1";

// 🎯 Generate meaningful title from message content
const generateChatTitle = (content) => {
  if (!content || content.trim().length === 0) return "New Chat";
  
  // Remove common prefixes and clean up
  const cleanContent = content
    .replace(/^(help|how|what|why|when|where|can|please|hey|hi|hello)\s+/i, "")
    .trim();
  
  // Take first 4-6 words for title
  const words = cleanContent.split(/\s+/).slice(0, 6);
  let title = words.join(" ");
  
  // Add ellipsis if original content was longer
  if (content.split(/\s+/).length > 6) {
    title += "...";
  }
  
  // Capitalize first letter
  title = title.charAt(0).toUpperCase() + title.slice(1);
  
  return title;
};

export const ChatProvider = ({ children }) => {
  // Helper for safe localStorage
  const safeLoad = (key) => {
    try {
      const val = localStorage.getItem(key);
      return val ? JSON.parse(val) : [];
    } catch {
      localStorage.removeItem(key);
      return [];
    }
  };

  const [projects, setProjects] = useState(() => safeLoad("corporate_ai_projects"));
  const [chats, setChats] = useState(() => safeLoad("corporate_ai_chats"));
  
  // Initialize currentChat and messages from localStorage
  const [currentChat, setCurrentChat] = useState(() => {
    const savedCurrentChat = localStorage.getItem("corporate_ai_currentChat");
    return savedCurrentChat ? Number(savedCurrentChat) : null;
  });
  
  const [currentProject, setCurrentProject] = useState(() => {
    const savedCurrentProject = localStorage.getItem("corporate_ai_currentProject");
    return savedCurrentProject ? Number(savedCurrentProject) : null;
  });
  
  const [messages, setMessages] = useState(() => {
    const savedCurrentChat = localStorage.getItem("corporate_ai_currentChat");
    if (!savedCurrentChat) return [];
    const allChats = safeLoad("corporate_ai_chats");
    const chat = allChats.find((c) => c.id === Number(savedCurrentChat));
    return chat?.messages || [];
  });

  // Model selection state
  const [selectedModel, setSelectedModel] = useState(() => {
    try {
      return localStorage.getItem(MODEL_STORAGE_KEY) || DEFAULT_MODEL;
    } catch {
      return DEFAULT_MODEL;
    }
  });

  const updateSelectedModel = (modelName) => {
    if (!MODEL_CONFIG[modelName]) return;
    setSelectedModel(modelName);
    try {
      localStorage.setItem(MODEL_STORAGE_KEY, modelName);
    } catch {
      // Ignore storage errors
    }
  };

  // 🧠 NEW: processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState("");

  const persist = (key, data) => localStorage.setItem(key, JSON.stringify(data));

  // 🆕 Create Project
  const createProject = ({ name, desc }) => {
    const project = {
      id: Date.now(),
      name,
      description: desc || "",
      createdAt: new Date().toISOString(),
    };
    const updated = [...projects, project];
    setProjects(updated);
    persist("corporate_ai_projects", updated);
    setCurrentProject(project.id);
    return project;
  };

  // 🆕 Start New Chat
  const startNewChat = (projectId = null) => {
    const effectiveProjectId = projectId || currentProject;
    const newChat = {
      id: Date.now(),
      title: "New Chat",
      messages: [],
      projectId: effectiveProjectId,
      createdAt: new Date().toISOString(),
    };
    const updated = [...chats, newChat];
    setChats(updated);
    setCurrentChat(newChat.id);
    setMessages([]);
    persist("corporate_ai_chats", updated);
    // Save current chat to localStorage
    localStorage.setItem("corporate_ai_currentChat", String(newChat.id));
    if (effectiveProjectId) {
      localStorage.setItem("corporate_ai_currentProject", String(effectiveProjectId));
    }
    // Ensure current project is set when creating chat in a project
    if (effectiveProjectId && !currentProject) {
      setCurrentProject(effectiveProjectId);
    }
    return newChat.id;
  };

  // ➕ Add Message + show processing text
  const addMessage = async (msg) => {
    let activeChatId = currentChat;
    if (!activeChatId) activeChatId = startNewChat(currentProject);

    const message = {
      role: msg.role || "user",
      content: msg.content || "",
      files: msg.files || [],
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...messages, message];
    setMessages(updatedMessages);

    let updatedChats = chats.map((chat) =>
      chat.id === activeChatId ? { ...chat, messages: updatedMessages } : chat
    );

    // 🪄 Auto-title first message with better naming
    const targetChat = updatedChats.find((c) => c.id === activeChatId);
    if (targetChat && targetChat.title === "New Chat" && msg.role === "user") {
      targetChat.title = generateChatTitle(msg.content);
    }

    setChats(updatedChats);
    persist("corporate_ai_chats", updatedChats);

    // 🧠 Simulate "Thinking / Analyzing / Generating" while processing
    if (msg.role === "user") {
      setIsProcessing(true);
      const steps = ["🧠 Thinking...", "🔍 Analyzing...", "✨ Generating..."];
      let i = 0;
      setProcessingMessage(steps[i]);
      const interval = setInterval(() => {
        i = (i + 1) % steps.length;
        setProcessingMessage(steps[i]);
      }, 1200);

      // Simulated response delay (replace with your AI call later)
      await new Promise((res) => setTimeout(res, 4000));

      clearInterval(interval);
      setIsProcessing(false);
      setProcessingMessage("");

      // 🔄 Get real AI response from backend API
      let aiReply = "";
      try {
        // Build conversation history - send last user message and context
        const maxMessages = 10;
        const recentMessages = updatedMessages.slice(-maxMessages);
        
        // Get the last user message content
        const lastUserMessage = recentMessages
          .filter(msg => msg.role === "user")
          .pop()?.content || msg.content;

        // Call backend chat API
        const targetModel =
          MODEL_CONFIG[selectedModel]?.id || MODEL_CONFIG[DEFAULT_MODEL].id;

        const response = await axiosInstance.post("/api/chat", {
          message: lastUserMessage,
          chatId: activeChatId,
          projectId: currentProject,
          model: targetModel,
          conversationHistory: recentMessages.map(msg => ({
            role: msg.role,
            content: msg.content.substring(0, 2000), // Limit message length
          })),
        });

        if (response.data && response.data.reply) {
          aiReply = response.data.reply;
        } else {
          throw new Error("No response from server");
        }
      } catch (error) {
        console.error("❌ Chat API error:", error);
        aiReply = `⚠️ Error: ${error.response?.data?.error || error.message || "Failed to get AI response. Please try again."}`;
      }

      // Add assistant's response
      const assistantMessage = {
        role: "assistant",
        content: aiReply,
        timestamp: new Date().toISOString(),
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);

      updatedChats = chats.map((chat) =>
        chat.id === activeChatId ? { ...chat, messages: finalMessages } : chat
      );
      setChats(updatedChats);
      persist("corporate_ai_chats", updatedChats);
    }
  };

  // 🔁 Switch Chat
  const switchChat = (chatId) => {
    const chat = chats.find((c) => c.id === chatId);
    if (chat) {
      setCurrentChat(chat.id);
      setCurrentProject(chat.projectId);
      setMessages(chat.messages || []);
      // Save current chat to localStorage for persistence on refresh
      localStorage.setItem("corporate_ai_currentChat", String(chat.id));
      localStorage.setItem("corporate_ai_currentProject", String(chat.projectId || ""));
    }
  };

  // 🗑 Delete Chat
  const deleteChat = (chatId) => {
    const updated = chats.filter((c) => c.id !== chatId);
    setChats(updated);
    persist("corporate_ai_chats", updated);
    if (currentChat === chatId) {
      setCurrentChat(null);
      setMessages([]);
    }
  };

  // 📂 Filter Chats by Project
  const getChatsByProject = (projectId) =>
    projectId ? chats.filter((c) => c.projectId === projectId) : chats;

  // 🔄 Sync messages when chat changes
  useEffect(() => {
    if (currentChat) {
      const chat = chats.find((c) => c.id === currentChat);
      if (chat) setMessages(chat.messages || []);
    }
  }, [currentChat, chats]);

  return (
    <ChatContext.Provider
      value={{
        chats,
        messages,
        projects,
        currentChat,
        currentProject,
        startNewChat,
        addMessage,
        switchChat,
        deleteChat,
        createProject,
        getChatsByProject,
        setCurrentProject,
        // 👇 new states for spinner
        isProcessing,
        processingMessage,
        // model controls
        selectedModel,
        setSelectedModel: updateSelectedModel,
        modelOptions: MODEL_CONFIG,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
