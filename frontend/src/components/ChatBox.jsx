import { useState } from "react";
import { HeartPulse, Loader2, RefreshCw, Send } from "lucide-react";
import { useChat } from "../hooks/useChat.js";
import { apiRequest } from "../services/api.js";
import Message from "./Message.jsx";

const openingQuestion = "What experience or situation would you like support with today?";

const quickSuggestions = [
  "Struggling with memories of a past event",
  "Feeling overwhelmed by recent emotional stress",
  "Experiencing sudden anxiety and tension",
];

export default function ChatBox({ onFeedback, onNavigate }) {
  const { messages, addMessage, setMessages } = useChat();
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [error, setError] = useState("");

  const visibleMessages = messages.length
    ? messages
    : [{ id: 1, sender: "bot", text: openingQuestion }];
  const hasUserResponse = visibleMessages.some((message) => message.sender === "user");

  const submitAnswer = async (answerText) => {
    const trimmed = answerText.trim();
    if (!trimmed || isSending || isFinishing) return;

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
    } catch (requestError) {
      setMessages(nextTranscript);
      setError(requestError.message || "The counselling API is not responding. Please check the backend and Groq connection.");
    } finally {
      setIsSending(false);
    }
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    submitAnswer(draft);
  };

  const handleFinish = async () => {
    if (!hasUserResponse || isFinishing) return;

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
    } catch (requestError) {
      setError(requestError.message || "The counselling API could not generate feedback. Please check the backend and Groq connection.");
    } finally {
      setIsFinishing(false);
    }
  };

  const handleReset = () => {
    setMessages([]);
    setDraft("");
    setError("");
  };

  return (
    <div className="chat-box">
      <div className="chat-header">
        <div className="chat-header-info">
          <div className="chat-avatar-badge">
            <HeartPulse size={20} />
          </div>
          <div>
            <div className="chat-title-wrap">
              <span className="chat-title">Trauma Assessment Assistant</span>
              <span className="chat-online-badge">
                <span className="online-dot" /> Live Active
              </span>
            </div>
            <p className="chat-subtitle">Free-form assessment conversation</p>
          </div>
        </div>

        <button
          type="button"
          className="chat-reset-btn"
          onClick={handleReset}
          title="Restart assessment"
          disabled={isSending || isFinishing}
        >
          <RefreshCw size={15} />
          <span>Reset</span>
        </button>
      </div>

      <div className="chat-progress-track">
        <div className="chat-progress-fill" style={{ width: hasUserResponse ? "100%" : "20%" }} />
      </div>

      <div className="message-list">
        {visibleMessages.map((message) => (
          <Message key={message.id} role={message.sender}>
            {message.text}
          </Message>
        ))}
      </div>

      {!isSending && !hasUserResponse && (
        <div className="chat-suggestions">
          <span className="suggestion-label">Quick suggestions:</span>
          <div className="suggestion-chips">
            {quickSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                className="suggestion-chip"
                onClick={() => submitAnswer(suggestion)}
              >
                <span>{suggestion}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <form className="chat-form" onSubmit={handleFormSubmit}>
        <input
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={isSending ? "Thinking..." : "Type your response..."}
          aria-label="Type a message"
          disabled={isSending || isFinishing}
        />
        <button
          type="submit"
          className="primary-btn"
          disabled={isSending || isFinishing || !draft.trim()}
        >
          {isSending ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>Sending</span>
            </>
          ) : (
            <>
              <span>Send</span>
              <Send size={16} />
            </>
          )}
        </button>
        <button
          type="button"
          className="secondary-btn"
          onClick={handleFinish}
          disabled={!hasUserResponse || isFinishing || isSending}
        >
          {isFinishing ? "Finishing" : "Finish"}
        </button>
      </form>
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}
