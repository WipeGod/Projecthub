"use client";

import React, { useEffect, useState, useRef } from "react";

interface Message {
  from: "user" | "zeno";
  text: string;
}

interface ZenoSidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function ZenoSidebar({ open, onClose }: ZenoSidebarProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setMessages([{ from: "zeno", text: "Hi! I’m Zeno, your AI assistant. Ask me anything about ProjectHub." }]);
    } else {
      setMessages([]);
      setInput("");
    }
  }, [open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    const userMessage = input.trim();
    setMessages((prev) => [...prev, { from: "user", text: userMessage }]);
    setInput("");
    try {
      const res = await fetch("http://localhost:5000/zeno", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({ message: userMessage }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, { from: "zeno", text: data.response }]);
      } else {
        setMessages((prev) => [...prev, { from: "zeno", text: "Sorry, I couldn’t process that right now." }]);
      }
    } catch {
      setMessages((prev) => [...prev, { from: "zeno", text: "Unable to connect to server." }]);
    }
  }

  return (
    <aside
      id="zeno-sidebar"
      className={`fixed right-0 top-16 w-80 h-[calc(100vh-4rem)] bg-white shadow-lg flex flex-col transform transition-transform ${
        open ? "translate-x-0" : "translate-x-full"
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="Zeno AI Assistant"
    >
      <div className="bg-blue-700 text-white font-bold p-4 flex justify-between items-center">
        <span>Zeno AI Assistant</span>
        <button onClick={onClose} aria-label="Close Zeno" className="text-white text-xl font-bold">
          &times;
        </button>
      </div>
      <div
        id="zeno-chat-messages"
        className="flex-grow p-4 overflow-y-auto bg-gray-100"
        tabIndex={0}
        role="log"
        aria-live="polite"
      >
        {messages.map((m, i) => (
          <div
            key={i}
            className={`mb-2 max-w-[80%] p-2 rounded-lg ${
              m.from === "user" ? "bg-blue-600 text-white ml-auto rounded-br-none" : "bg-white text-gray-900 rounded-bl-none"
            }`}
          >
            {m.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form
        id="zeno-input-container"
        onSubmit={sendMessage}
        aria-label="Send message to Zeno"
        className="p-2 border-t border-gray-300 flex gap-2"
      >
        <input
          id="zeno-input"
          type="text"
          placeholder="Ask Zeno..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          required
          aria-required="true"
          autoComplete="off"
          className="flex-grow border border-gray-400 rounded px-2 py-1"
        />
        <button type="submit" aria-label="Send message" className="bg-blue-600 text-white px-4 rounded">
          Send
        </button>
      </form>
    </aside>
  );
}
