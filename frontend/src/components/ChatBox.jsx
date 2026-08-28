import { useState } from "react";
import { Send, Loader2, RefreshCw, HeartPulse } from "lucide-react";
import { useChat } from "../hooks/useChat.js";
import { apiRequest } from "../services/api.js";
import Message from "./Message.jsx";

const prompts = [
  {
    key: "experience",
    stepName: "Initial Situation",
    text: "What experience, trauma, or stress challenge would you like support with today?",
    suggestions: [
      "High work, academic, or life stress and burnout",
      "Struggling with memories of a past event",
      "Experiencing sudden anxiety, panic, or tension"
    ]
  },
  {
    key: "feeling",
    stepName: "Current Impact",
    text: "How is this situation or stress affecting your emotions or body right now?",
    suggestions: [
      "Physical tension, headaches, and fast heart rate",
      "Constantly on edge, tense, and alert",
      "Feeling emotionally exhausted, numb, or detached"
    ]
  },
  {
    key: "support",
    stepName: "Helpful Support",
    text: "What kind of support or guidance would feel most helpful to you next?",
    suggestions: [
      "Immediate stress reduction & box-breathing exercises",
      "Understanding my risk priority level",
      "Action steps for professional stress & trauma care"
    ]
  },
];

function buildFeedback(answers, apiResponse) {
  const safeAnswers = {
    experience: answers?.experience || "General trauma and stress assessment inquiry",
    feeling: answers?.feeling || "Experiencing emotional or physical stress",
    support: answers?.support || "Seeking stress reduction and clinical care plan",
  };

  const combinedText = Object.values(safeAnswers).join(" ").toLowerCase();
  
  const urgentTerms = ["unsafe", "suicide", "self harm", "hurt myself", "danger", "panic", "flashback", "nightmare", "severe", "exhausted", "burnout"];
  const moderateTerms = ["fear", "anxiety", "memories", "stress", "tension", "headaches", "work", "overwhelmed", "alone", "numb", "detached"];
  
  const isHigh = urgentTerms.some((term) => combinedText.includes(term));
  const isModerate = moderateTerms.some((term) => combinedText.includes(term));
  
  const riskLevel = isHigh ? "High" : isModerate ? "Moderate" : "Low";

  const recommendations = {
    High: [
      "Prioritize immediate safety and stress de-escalation. Connect with a trusted healthcare responder or 24/7 helpline.",
      "Use Guided 4-7-8 Box Breathing immediately: Inhale 4s, Hold 4s, Exhale 4s, Rest 4s.",
      "Schedule a priority evaluation for acute stress or PTSD with a certified therapist.",
      "Minimize overwhelming stimuli and isolate a quiet, comforting space."
    ],
    Moderate: [
      "Implement a structured daily stress-management routine (Box breathing twice daily).",
      "Practice Progressive Muscle Relaxation (PMR): Tense and release muscle groups from feet to jaw.",
      "Maintain a daily stress log identifying specific triggers, caffeine/sleep patterns, and emotional spikes.",
      "Set firm boundaries around work/study hours and take 10-minute sensory breaks."
    ],
    Low: [
      "Maintain steady sleep hygiene (7-8 hours per night) and regular hydration.",
      "Incorporate 15 minutes of light physical movement or nature walking daily.",
      "Keep a journal of positive grounding moments and stress relief milestones.",
      "Review your personalized care plan whenever new life stressors emerge."
    ],
  };

  const summaries = {
    High: "High Stress & Trauma Support Priority: Response analysis indicates acute emotional/physical strain requiring active intervention and stress de-escalation.",
    Moderate: "Moderate Stress & Trauma Priority: Response analysis indicates noticeable stress and burnout risk benefiting from structured coping routines.",
    Low: "Low Stress Priority: Response analysis indicates manageable tension levels suitable for routine self-care and wellness tracking."
  };

  return {
    answers: safeAnswers,
    riskLevel,
    recommendations: recommendations[riskLevel],
    backendReply: apiResponse?.reply || "Assessment completed successfully. Tailored trauma & stress management plan generated.",
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
      text: "Thank you. Analyzing your responses and generating your trauma & stress assessment feedback...",
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
              <span className="chat-title">Trauma & Stress Assessment Assistant</span>
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
