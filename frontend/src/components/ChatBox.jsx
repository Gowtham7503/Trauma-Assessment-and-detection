import { useState } from "react";
import { Send, Loader2, RefreshCw, ShieldCheck, Sparkles, HeartPulse } from "lucide-react";
import { useChat } from "../hooks/useChat.js";
import { apiRequest } from "../services/api.js";
import Message from "./Message.jsx";

const prompts = [
  {
    key: "experience",
    stepName: "Initial Situation",
    text: "What experience or situation would you like support with today?",
    suggestions: [
      "Struggling with memories of a past event",
      "Feeling overwhelmed by recent emotional stress",
      "Experiencing sudden anxiety and tension"
    ]
  },
  {
    key: "feeling",
    stepName: "Current Impact",
    text: "How is this situation affecting your emotions or body right now?",
    suggestions: [
      "Constantly on edge, tense, and alert",
      "Feeling emotionally numb or detached",
      "Difficulty sleeping or having nightmares"
    ]
  },
  {
    key: "support",
    stepName: "Helpful Support",
    text: "What kind of support or guidance would feel most helpful to you next?",
    suggestions: [
      "Immediate grounding & calming exercises",
      "Understanding my risk priority level",
      "Action steps for a professional follow-up"
    ]
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
    summary: `The responses suggest a ${riskLevel.toLowerCase()} support priority based on the current assessment.`,
    createdAt: new Date().toISOString(),
  };
}

export default function ChatBox({ onFeedback, onNavigate }) {
  const { messages, addMessage, setMessages } = useChat();
  const [draft, setDraft] = useState("");
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isSending, setIsSending] = useState(false);

  const currentPrompt = prompts[stepIndex] || prompts[0];
  const progressPercent = Math.round(((stepIndex + 1) / prompts.length) * 100);

  const visibleMessages = messages.length
    ? messages
    : [{ id: 1, sender: "bot", text: prompts[0].text }];

  const submitAnswer = async (answerText) => {
    const trimmed = answerText.trim();
    if (!trimmed || isSending) return;

    addMessage({ id: Date.now(), sender: "user", text: trimmed });
    setDraft("");

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
      text: "Thank you. I am calculating your assessment feedback now.",
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

  const handleFormSubmit = (event) => {
    event.preventDefault();
    submitAnswer(draft);
  };

  const handleReset = () => {
    setMessages([]);
    setStepIndex(0);
    setAnswers({});
    setDraft("");
  };

  return (
    <div className="chat-box">
      {/* Live Clinical Assessment Header */}
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
            <p className="chat-subtitle">
              Step {stepIndex + 1} of 3: {currentPrompt.stepName}
            </p>
          </div>
        </div>

        <button
          type="button"
          className="chat-reset-btn"
          onClick={handleReset}
          title="Restart Assessment"
        >
          <RefreshCw size={15} />
          <span>Reset</span>
        </button>
      </div>

      {/* Assessment Progress Meter Bar */}
      <div className="chat-progress-track">
        <div 
          className="chat-progress-fill" 
          style={{ width: `${progressPercent}%` }} 
        />
      </div>

      {/* Messages Scroll Area */}
      <div className="message-list">
        {visibleMessages.map((message) => (
          <Message key={message.id} role={message.sender}>
            {message.text}
          </Message>
        ))}
      </div>

      {/* Quick Suggestion Chips */}
      {!isSending && currentPrompt.suggestions && (
        <div className="chat-suggestions">
          <span className="suggestion-label">Quick suggestions:</span>
          <div className="suggestion-chips">
            {currentPrompt.suggestions.map((suggestion) => (
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

      {/* Chat Input Form */}
      <form className="chat-form" onSubmit={handleFormSubmit}>
        <input
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={isSending ? "Calculating feedback..." : "Type your response here..."}
          aria-label="Type your response"
          disabled={isSending}
        />
        <button type="submit" className="primary-btn" disabled={isSending || !draft.trim()}>
          {isSending ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <span>Send</span>
              <Send size={16} />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
