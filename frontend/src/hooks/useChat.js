import { useEffect, useState } from "react";

const CHAT_STORAGE_KEY = "trauma-assessment-chat";

export function useChat() {
  const [messages, setMessages] = useState(() => {
    try {
      const savedMessages = localStorage.getItem(CHAT_STORAGE_KEY);
      return savedMessages ? JSON.parse(savedMessages) : [];
    } catch {
      return [];
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

  return { messages, addMessage, setMessages };
}
