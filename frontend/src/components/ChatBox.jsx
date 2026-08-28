import { useState } from "react";
import { useChat } from "../hooks/useChat.js";
import { apiRequest } from "../services/api.js";
import Message from "./Message.jsx";

const openingQuestion = "What experience or situation would you like support with today?";

export default function ChatBox({ onFeedback, onNavigate }) {
  const { messages, addMessage, setMessages } = useChat();
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [error, setError] = useState("");
  const visibleMessages = messages.length
    ? messages
    : [{ id: 1, sender: "bot", text: openingQuestion }];

  const handleSend = async (event) => {
    event.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed || isSending) return;

    const userMessage = { id: Date.now(), sender: "user", text: trimmed };
    const nextTranscript = [...visibleMessages, userMessage];
    addMessage(userMessage);
    setDraft("");
    setError("");
    setIsSending(true);

    try {
      const apiResponse = await apiRequest("/chat/", {
        method: "POST",
        body: JSON.stringify({ messages: nextTranscript }),
      });
      const botMessage = {
        id: Date.now() + 1,
        sender: "bot",
        text: apiResponse.reply,
      };
      setMessages([...nextTranscript, botMessage]);
    } catch {
      setMessages(nextTranscript);
      setError("The counselling API is not responding. Please check the backend and Groq connection.");
    } finally {
      setIsSending(false);
    }
  };

  const handleFinish = async () => {
    if (isFinishing) return;

    setError("");
    setIsFinishing(true);

    try {
      const apiResponse = await apiRequest("/chat/feedback", {
        method: "POST",
        body: JSON.stringify({ messages: visibleMessages }),
      });

      onFeedback({
        ...apiResponse.feedback,
        answers: visibleMessages
          .filter((message) => message.sender === "user")
          .reduce((currentAnswers, message, index) => {
            currentAnswers[`response${index + 1}`] = message.text;
            return currentAnswers;
          }, {}),
        createdAt: new Date().toISOString(),
      });
      onNavigate("feedback");
    } catch {
      setError("The counselling API could not generate feedback. Please check the backend and Groq connection.");
    } finally {
      setIsFinishing(false);
    }
  };

  const hasUserResponse = visibleMessages.some((message) => message.sender === "user");

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
          placeholder={isSending ? "Thinking..." : "Type your response..."}
          aria-label="Type a message"
          disabled={isSending || isFinishing}
        />
        <button type="submit" className="primary-btn" disabled={isSending || isFinishing}>
          {isSending ? "Sending" : "Send"}
        </button>
        <button type="button" className="secondary-btn" onClick={handleFinish} disabled={!hasUserResponse || isFinishing}>
          {isFinishing ? "Finishing" : "Finish"}
        </button>
      </form>
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}
