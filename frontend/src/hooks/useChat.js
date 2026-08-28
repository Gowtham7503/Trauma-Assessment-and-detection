import { useEffect, useState } from "react";

const CHAT_STORAGE_KEY = "trauma-assessment-chat";

const initialBotMessage = {
  id: 1,
  sender: "bot",
  text: "Which area should we focus on first: current stress, a trauma-related experience, or both?",
};

export function useChat() {
  const [messages, setMessages] = useState(() => {
    try {
      const savedMessages = localStorage.getItem(CHAT_STORAGE_KEY);
      return savedMessages ? JSON.parse(savedMessages) : [initialBotMessage];
    } catch {
      return [initialBotMessage];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // Keep chat usable even if browser storage is unavailable.
    }
  }, [messages]);

  function addMessage(message) {
    setMessages((currentMessages) => [...currentMessages, message]);
  }

  function resetMessages() {
    setMessages([initialBotMessage]);
  }

  return { messages, addMessage, resetMessages, setMessages };
}
