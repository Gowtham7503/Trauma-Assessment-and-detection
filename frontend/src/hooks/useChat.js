import { useState } from "react";

const initialBotMessage = {
  id: 1,
  sender: "bot",
  text: "What experience or situation would you like support with today?"
};

export function useChat() {
  const [messages, setMessages] = useState([initialBotMessage]);

  function addMessage(message) {
    setMessages((currentMessages) => [...currentMessages, message]);
  }

  function resetMessages() {
    setMessages([initialBotMessage]);
  }

  return { messages, addMessage, resetMessages, setMessages };
}
