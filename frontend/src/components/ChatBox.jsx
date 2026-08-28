import { useState } from "react";
import { useChat } from "../hooks/useChat.js";
import { apiRequest } from "../services/api.js";
import Message from "./Message.jsx";

const openingQuestion = "What experience or situation would you like support with today?";
const fallbackQuestion = "Thank you for sharing that. Are you feeling safe right now?";

function buildFeedback(transcript, backendReply) {
  const userResponses = transcript.filter((message) => message.sender === "user");
  const combinedText = userResponses.map((message) => message.text).join(" ").toLowerCase();
  const urgentTerms = ["unsafe", "suicide", "self harm", "hurt myself", "danger", "panic"];
  const moderateTerms = ["fear", "anxiety", "nightmare", "flashback", "alone", "stress"];
  const riskLevel = urgentTerms.some((term) => combinedText.includes(term))
    ? "High"
    : moderateTerms.some((term) => combinedText.includes(term))
      ? "Moderate"
      : "Low";

  const recommendations = {
    High: [
      "Prioritize immediate safety and connect with a trusted person or local emergency support.",
      "Use grounding steps now: name five things you see, four you feel, and three you hear.",
      "Arrange a professional follow-up as soon as possible.",
    ],
    Moderate: [
      "Plan a supportive check-in within the next 24 hours.",
      "Use one calming routine: slow breathing, sensory grounding, or a brief walk.",
      "Write down triggers and coping steps to discuss with a care provider.",
    ],
    Low: [
      "Continue tracking feelings and any repeated triggers.",
      "Keep one trusted support contact available.",
      "Practice a steady routine for sleep, food, movement, and rest.",
    ],
  };

  return {
    answers: userResponses.reduce((currentAnswers, message, index) => {
      currentAnswers[`response${index + 1}`] = message.text;
      return currentAnswers;
    }, {}),
    riskLevel,
    recommendations: recommendations[riskLevel],
    backendReply: backendReply || "Feedback prepared from the submitted chat inputs.",
    summary: `The responses suggest a ${riskLevel.toLowerCase()} support priority based on the current chat.`,
    createdAt: new Date().toISOString(),
  };
}

export default function ChatBox({ onFeedback, onNavigate }) {
  const { messages, addMessage, setMessages } = useChat();
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
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
    setIsSending(true);

    try {
      const apiResponse = await apiRequest("/chat/", {
        method: "POST",
        body: JSON.stringify({ messages: nextTranscript }),
      });
      const botMessage = {
        id: Date.now() + 1,
        sender: "bot",
        text: apiResponse?.reply || fallbackQuestion,
      };
      setMessages([...nextTranscript, botMessage]);
    } catch {
      const botMessage = {
        id: Date.now() + 1,
        sender: "bot",
        text: fallbackQuestion,
      };
      setMessages([...nextTranscript, botMessage]);
    } finally {
      setIsSending(false);
    }
  };

  const handleFinish = () => {
    const lastBotReply = [...visibleMessages].reverse().find((message) => message.sender === "bot")?.text;
    onFeedback(buildFeedback(visibleMessages, lastBotReply));
    onNavigate("feedback");
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
          disabled={isSending}
        />
        <button type="submit" className="primary-btn" disabled={isSending}>
          {isSending ? "Sending" : "Send"}
        </button>
        <button type="button" className="secondary-btn" onClick={handleFinish} disabled={!hasUserResponse}>
          Finish
        </button>
      </form>
    </div>
  );
}
