// src/components/ProjectModal.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";

export default function ProjectModal({ isOpen, onClose, onCreate }) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleCreate = () => {
    if (!name.trim()) {
      setError("Project name is required");
      return;
    }
    onCreate({ name: name.trim(), desc: desc.trim() });
    setName("");
    setDesc("");
    setError("");
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target.id === "modal-backdrop") onClose();
  };

  return (
    <div
      id="modal-backdrop"
      onClick={handleBackdropClick}
      className="fixed inset-0 flex items-center justify-center bg-black/70 z-50 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.25 }}
        className="bg-gray-900 rounded-xl p-6 w-[420px] text-white border border-gray-700 shadow-xl"
      >
        <h2 className="text-xl font-semibold mb-4 text-purple-400">
          🧩 Create New Project
        </h2>

        <input
          type="text"
          placeholder="Enter project name"
          className="w-full mb-3 p-2 rounded bg-gray-800 outline-none text-sm text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError("");
          }}
        />

        <textarea
          placeholder="Describe your project (optional)"
          className="w-full mb-4 p-2 rounded bg-gray-800 outline-none text-sm text-white placeholder-gray-400 h-24 resize-none focus:ring-2 focus:ring-purple-500"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />

        {error && <p className="text-red-400 text-xs mb-3">{error}</p>}

        <div className="flex justify-end gap-3 mt-3">
          <button
            onClick={onClose}
            className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-md text-sm transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            className="bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-md text-sm font-medium transition-all"
          >
            Create
          </button>
        </div>
      </motion.div>
    </div>
  );
}
