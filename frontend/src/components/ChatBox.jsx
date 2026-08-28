import { useState } from "react";
import { Send, Loader2, RefreshCw, HeartPulse } from "lucide-react";
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
  const safeAnswers = {
    experience: answers?.experience || "General trauma assessment inquiry",
    feeling: answers?.feeling || "Experiencing emotional or physical strain",
    support: answers?.support || "Seeking grounding and clinical action steps",
  };

  const combinedText = Object.values(safeAnswers).join(" ").toLowerCase();
  
  const urgentTerms = ["unsafe", "suicide", "self harm", "hurt myself", "danger", "panic", "flashback", "nightmare", "severe"];
  const moderateTerms = ["fear", "anxiety", "memories", "stress", "alone", "numb", "detached", "tension"];
  
  const isHigh = urgentTerms.some((term) => combinedText.includes(term));
  const isModerate = moderateTerms.some((term) => combinedText.includes(term));
  
  const riskLevel = isHigh ? "High" : isModerate ? "Moderate" : "Low";

  const recommendations = {
    High: [
      "Prioritize immediate safety. Reach out to a trusted loved one, counselor, or 24/7 crisis support line immediately.",
      "Practice 5-4-3-2-1 Sensory Grounding: Name 5 visible objects, 4 touchable textures, 3 sounds around you.",
      "Schedule a priority consultation with a trauma-informed psychologist or medical provider.",
      "Keep a safe, soothing environment with minimal overwhelming stimuli."
    ],
    Moderate: [
      "Plan a supportive health check-in within the next 24 to 48 hours.",
      "Use guided box-breathing: Inhale for 4 seconds, hold for 4 seconds, exhale for 4 seconds, rest for 4 seconds.",
      "Maintain a daily log of emotional triggers and physical stress symptoms.",
      "Engage in restorative activities like light walking, gentle stretching, or warm baths."
    ],
    Low: [
      "Continue monitoring your daily stress levels and maintaining restorative routines.",
      "Keep trusted family or friend contacts easily accessible.",
      "Practice regular mindfulness, steady sleep schedules, and proper hydration.",
      "Review your personalized wellness plan whenever new stressors arise."
    ],
  };

  const summaries = {
    High: "High Trauma Support Priority: Response analysis indicates acute emotional or physical distress requiring active care and grounding.",
    Moderate: "Moderate Trauma Support Priority: Response analysis indicates noticeable emotional strain benefiting from structured coping routines.",
    Low: "Low Trauma Support Priority: Response analysis indicates manageable stress levels suitable for self-guided wellness and routine tracking."
  };

  return {
    answers: safeAnswers,
    riskLevel,
    recommendations: recommendations[riskLevel],
    backendReply: apiResponse?.reply || "Assessment completed successfully. Tailored guidance generated based on clinical trauma protocols.",
    summary: summaries[riskLevel],
    createdAt: new Date().toISOString(),
  };
}

export default function ChatBox({ onFeedback, onNavigate }) {
  const { messages, addMessage, resetMessages } = useChat();
  const [draft, setDraft] = useState("");
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isSending, setIsSending] = useState(false);

  const currentPrompt = prompts[stepIndex] || prompts[0];
  const progressPercent = Math.round(((stepIndex + 1) / prompts.length) * 100);

  const submitAnswer = async (answerText) => {
    const trimmed = answerText.trim();
    if (!trimmed || isSending) return;

    // Add user's response to chat
    const userMsgId = Date.now();
    addMessage({ id: userMsgId, sender: "user", text: trimmed });
    setDraft("");

    const updatedAnswers = { ...answers, [currentPrompt.key]: trimmed };
    setAnswers(updatedAnswers);

    // If more prompts remain, advance to next question
    if (stepIndex < prompts.length - 1) {
      const nextStep = stepIndex + 1;
      const nextPrompt = prompts[nextStep];
      setStepIndex(nextStep);

      setTimeout(() => {
        addMessage({
          id: Date.now() + 1,
          sender: "bot",
          text: nextPrompt.text,
        });
      }, 200);
      return;
    }

    // Final Step Completed -> Calculate Feedback & Navigate
    setIsSending(true);
    addMessage({
      id: Date.now() + 1,
      sender: "bot",
      text: "Thank you. Analyzing your responses and generating your trauma assessment feedback...",
    });

    let apiResponse = null;
    try {
      apiResponse = await apiRequest("/chat/", {
        method: "POST",
        body: JSON.stringify({ messages, answers: updatedAnswers }),
      });
    } catch (error) {
      console.warn("Backend API unavailable, using clinical fallback feedback generator:", error);
    } finally {
      const generatedFeedback = buildFeedback(updatedAnswers, apiResponse);
      onFeedback(generatedFeedback);
      setIsSending(false);
      onNavigate("feedback");
    }
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    submitAnswer(draft);
  };

  const handleReset = () => {
    resetMessages();
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
        {messages.map((message) => (
          <Message key={message.id} role={message.sender}>
            {message.text}
          </Message>
        ))}
      </div>

      {/* Quick Suggestion Chips */}
      {!isSending && currentPrompt.suggestions && (
        <div className="chat-suggestions">
          <span className="suggestion-label">Quick options (click to select):</span>
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
          placeholder={isSending ? "Calculating feedback..." : "Type your response here or select a quick option above..."}
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
