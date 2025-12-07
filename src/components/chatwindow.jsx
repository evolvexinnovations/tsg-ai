import React, { useEffect, useRef, useContext } from "react";
import { Box, Paper, Stack, Avatar, CircularProgress, Typography } from "@mui/material";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css"; // for nice syntax highlighting
import { ChatContext } from "../context/chatcontext";

export default function ChatWindow({ messages = [] }) {
  const chatEndRef = useRef(null);
  const { isProcessing, processingMessage } = useContext(ChatContext);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isProcessing, processingMessage]);

  return (
    <Box
      sx={{
        flex: 1,
        overflowY: "auto",
        px: 4,
        py: 3,
        bgcolor: "grey.900",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {messages.length === 0 ? (
        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "grey.500",
          }}
        >
          Start a new chat to begin!
        </Box>
      ) : (
        <Stack spacing={2}>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Stack
                direction={msg.role === "user" ? "row-reverse" : "row"}
                alignItems="flex-start"
                spacing={1.5}
              >
                {/* Avatar */}
                <Avatar
                  sx={{
                    bgcolor:
                      msg.role === "user" ? "#FFD700" : "#1a1a1a",
                    color: msg.role === "user" ? "#000000" : "#FFD700",
                    width: 32,
                    height: 32,
                    fontSize: 14,
                    border: msg.role === "user" ? "none" : "1px solid #FFD700",
                  }}
                >
                  {msg.role === "user" ? "U" : "AI"}
                </Avatar>

                {/* Message Bubble */}
                <Paper
                  elevation={3}
                  sx={{
                    p: 2,
                    maxWidth: "75%",
                    bgcolor:
                      msg.role === "user" ? "#FFD700" : "#1a1a1a",
                    color: msg.role === "user" ? "#000000" : "#FFD700",
                    borderRadius: 3,
                    borderBottomRightRadius:
                      msg.role === "user" ? 0 : 3,
                    borderBottomLeftRadius:
                      msg.role === "assistant" ? 0 : 3,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    fontSize: "0.95rem",
                    border: msg.role === "assistant" ? "1px solid #FFD700" : "none",
                  }}
                >
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight]}
                    components={{
                      p: ({ children }) => (
                        <span style={{ lineHeight: 1.6 }}>{children}</span>
                      ),
                      code: ({ node, inline, className, children, ...props }) =>
                        inline ? (
                          <code
                            style={{
                              backgroundColor: "rgba(255,255,255,0.1)",
                              padding: "2px 6px",
                              borderRadius: "4px",
                            }}
                            {...props}
                          >
                            {children}
                          </code>
                        ) : (
                          <pre
                            style={{
                              backgroundColor: "#1e1e1e",
                              padding: "10px",
                              borderRadius: "6px",
                              overflowX: "auto",
                            }}
                          >
                            <code className={className} {...props}>
                              {children}
                            </code>
                          </pre>
                        ),
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </Paper>
              </Stack>
            </motion.div>
          ))}
          
          {/* 🧠 Processing Message Indicator */}
          {isProcessing && processingMessage && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Stack
                direction="row"
                alignItems="center"
                spacing={1.5}
              >
                <Avatar
                  sx={{
                    bgcolor: "#1a1a1a",
                    color: "#FFD700",
                    width: 32,
                    height: 32,
                    fontSize: 14,
                    border: "1px solid #FFD700",
                  }}
                >
                  AI
                </Avatar>
                <Paper
                  elevation={3}
                  sx={{
                    p: 2,
                    maxWidth: "75%",
                    bgcolor: "#1a1a1a",
                    color: "#FFD700",
                    borderRadius: 3,
                    borderBottomLeftRadius: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    border: "1px solid #FFD700",
                  }}
                >
                  <CircularProgress size={18} sx={{ color: "#FFD700" }} />
                  <Typography sx={{ fontSize: "0.95rem", fontStyle: "italic" }}>
                    {processingMessage}
                  </Typography>
                </Paper>
              </Stack>
            </motion.div>
          )}
        </Stack>
      )}
      <div ref={chatEndRef} />
    </Box>
  );
}
