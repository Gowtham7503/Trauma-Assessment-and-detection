import { useState } from "react";


export function useChat() {
  const [messages, setMessages] = useState([]);

  function addMessage(message) {
    setMessages((currentMessages) => [...currentMessages, message]);
  }

  return { messages, addMessage };
}

