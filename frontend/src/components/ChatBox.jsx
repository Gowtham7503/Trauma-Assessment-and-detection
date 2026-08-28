import { useState } from "react";
import { useChat } from "../hooks/useChat.js";
import { apiRequest } from "../services/api.js";
import Message from "./Message.jsx";

const prompts = [
  {
    key: "experience",
    text: "What experience or situation would you like support with today?",
  },
  {
    key: "feeling",
    text: "How is this affecting you right now?",
  },
  {
    key: "support",
    text: "What kind of support would feel most helpful next?",
  },
];

function buildFeedback(answers, apiResponse) {
  const combinedText = Object.values(answers).join(" ").toLowerCase();
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
    answers,
    riskLevel,
    recommendations: recommendations[riskLevel],
    backendReply: apiResponse?.reply || "Feedback prepared from the submitted chat inputs.",
    summary: `The responses suggest a ${riskLevel.toLowerCase()} support priority based on the current chat.`,
    createdAt: new Date().toISOString(),
  };
}

export default function ChatBox({ onFeedback, onNavigate }) {
  const { messages, addMessage } = useChat();
  const [draft, setDraft] = useState("");
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isSending, setIsSending] = useState(false);
  const visibleMessages = messages.length
    ? messages
    : [{ id: 1, sender: "bot", text: prompts[0].text }];

  const handleSend = async (event) => {
    event.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed || isSending) return;

    addMessage({ id: Date.now(), sender: "user", text: trimmed });
    setDraft("");

    const currentPrompt = prompts[stepIndex];
    const nextAnswers = { ...answers, [currentPrompt.key]: trimmed };
    setAnswers(nextAnswers);

    if (stepIndex < prompts.length - 1) {
      const nextPrompt = prompts[stepIndex + 1];
      setStepIndex((current) => current + 1);
      addMessage({
        id: Date.now() + 1,
        sender: "bot",
        text: nextPrompt.text,
      });
      return;
    }

    setIsSending(true);
    addMessage({
      id: Date.now() + 1,
      sender: "bot",
      text: "Thank you. I am preparing your feedback now.",
    });

    try {
      const apiResponse = await apiRequest("/chat/", {
        method: "POST",
        body: JSON.stringify({ messages: visibleMessages, answers: nextAnswers }),
      });
      onFeedback(buildFeedback(nextAnswers, apiResponse));
    } catch {
      onFeedback(buildFeedback(nextAnswers, null));
    } finally {
      setIsSending(false);
      onNavigate("feedback");
    }
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
          placeholder={isSending ? "Preparing feedback..." : "Type your response..."}
          aria-label="Type a message"
          disabled={isSending}
        />
        <button type="submit" className="primary-btn" disabled={isSending}>
          {isSending ? "Sending" : "Send"}
        </button>
      </form>
    </div>
  );
}
