import { useEffect, useState } from "react";

const initialBotMessage = {
  id: 1,
  sender: "bot",
  text: "What experience or situation would you like support with today?"
};

export function useChat() {
  const [messages, setMessages] = useState([initialBotMessage]);
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

  function resetMessages() {
    setMessages([initialBotMessage]);
  }

  return { messages, addMessage, resetMessages, setMessages };
  return { messages, addMessage, setMessages };
}
