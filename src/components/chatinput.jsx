import React, { useState, useContext, useRef, useEffect } from "react";
import {
  Box,
  TextField,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import { Send, Mic, Stop, AttachFile } from "@mui/icons-material";
import { ChatContext } from "../context/chatcontext";
import ModelSelector from "./modelselector";

export default function ChatInput() {
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);
  const { addMessage, isProcessing } = useContext(ChatContext);

  // 🎤 Setup mic
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-IN";
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.onresult = (event) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInput(transcript);
      };
      recognition.onend = () => setListening(false);
      recognitionRef.current = recognition;
    }
  }, []);

  // 🚀 Send Message
  const handleSend = async () => {
    if (!input.trim()) return;
    
    try {
      const userMessage = {
        role: "user",
        content: input.trim(),
      };

      // Send the message which will trigger processing animations
      await addMessage(userMessage);
    } finally {
      // Clear input immediately after sending
      setInput("");
    }
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center", py: 2, bgcolor: "grey.900" }}>
      <Paper
        elevation={10}
        sx={{
          display: "flex",
          alignItems: "center",
          width: "75%",
          maxWidth: "950px",
          borderRadius: 4,
          px: 2,
          py: 1.2,
          bgcolor: "#2d2d2d",
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={1.5}
          sx={{ flex: 1 }}
        >
          {/* 📎 Upload - DISABLED */}
          <Tooltip title="File upload disabled">
            <IconButton
              disabled
              sx={{
                color: "#666666",
                position: "relative",
                cursor: "not-allowed",
                opacity: 0.5,
              }}
            >
              <AttachFile />
            </IconButton>
          </Tooltip>

          {/* 🎤 Mic */}
          <Tooltip title={listening ? "Stop Listening" : "Speak"}>
            <IconButton
              color={listening ? "error" : "primary"}
              onClick={() => {
                if (!recognitionRef.current) return;
                if (listening) {
                  recognitionRef.current.stop();
                  setListening(false);
                } else {
                  recognitionRef.current.start();
                  setListening(true);
                }
              }}
            >
              {listening ? <Stop /> : <Mic />}
            </IconButton>
          </Tooltip>

          {/* 🤖 Model Selector near input */}
          <Box sx={{ display: "flex", alignItems: "center", mr: 1 }}>
            <ModelSelector />
          </Box>

          {/* 📝 Text Field */}
          <TextField
            fullWidth
            placeholder="Type or speak your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            InputProps={{
              sx: {
                color: "white",
                bgcolor: "#3b3b3b",
                borderRadius: 2,
                "& fieldset": { border: "none" },
              },
            }}
          />

          {/* 📤 Send */}
          {isProcessing ? (
            <CircularProgress size={28} sx={{ color: "#1976d2", ml: 1 }} />
          ) : (
            <Tooltip title="Send">
              <IconButton
                onClick={handleSend}
                disabled={isProcessing}
                sx={{
                  bgcolor: "#1976d2",
                  color: "white",
                  "&:hover": { bgcolor: "#1565c0" },
                  "&:disabled": { bgcolor: "#888888", color: "#cccccc" },
                  borderRadius: 2,
                }}
              >
                <Send fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      </Paper>
    </Box>
  );
}
