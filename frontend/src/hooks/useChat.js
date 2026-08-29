import { useEffect, useState } from "react";

const CHAT_STORAGE_KEY = "trauma-assessment-chat";

const initialBotMessage = {
  id: 1,
  sender: "bot",
  text: "What is the main reason you are seeking support today? You can mention current stress, something upsetting that happened, or both.",
};

const staleInitialPrompt = "Which area should we focus on first: current stress, a trauma-related experience, or both?";
const unclearInitialPrompt = "What made you seek support today? You can describe stress, a trauma-related experience, or both in your own words.";

export function useChat() {
  const [messages, setMessages] = useState(() => {
    try {
      const savedMessages = localStorage.getItem(CHAT_STORAGE_KEY);
      const parsedMessages = savedMessages ? JSON.parse(savedMessages) : [initialBotMessage];

      if (
        parsedMessages.length === 1
        && parsedMessages[0]?.sender === "bot"
        && [staleInitialPrompt, unclearInitialPrompt].includes(parsedMessages[0]?.text)
      ) {
        return [initialBotMessage];
      }

      return parsedMessages;
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
