import { useState } from "react";
import { useChat } from "../hooks/useChat.js";
import Message from "./Message.jsx";

const starterMessages = [
  { id: 1, sender: "bot", text: "Hi team, I’ve reviewed the latest assessment notes. Are there any immediate follow-up items?" },
  { id: 2, sender: "user", text: "Client needs a check-in after the next appointment and a reminder about grounding strategies." },
];

export default function ChatBox() {
  const { messages, addMessage } = useChat();
  const [draft, setDraft] = useState("");
  const visibleMessages = messages.length ? messages : starterMessages;

  const handleSend = (event) => {
    event.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed) return;

    addMessage({ id: Date.now(), sender: "user", text: trimmed });
    setDraft("");

    window.setTimeout(() => {
      addMessage({
        id: Date.now() + 1,
        sender: "bot",
        text: "Thanks for the update. I’ve marked the follow-up and flagged the support review for the next care window.",
      });
    }, 300);
  };

  return (
    <div className="chat-box">
      <div className="message-list">
        {visibleMessages.map((message) => (
          <Message key={message.id} role={message.sender}>
            {message.text}
          </Message>
        ))}
      </div>

      <form className="chat-form" onSubmit={handleSend}>
        <input
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Share a coordination note..."
          aria-label="Type a message"
        />
        <button type="submit" className="primary-btn">Send</button>
      </form>
    </div>
  );
}

