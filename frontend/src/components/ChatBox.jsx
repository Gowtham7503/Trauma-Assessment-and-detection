import { useState } from "react";
import { HeartPulse, Loader2, RefreshCw, Send } from "lucide-react";
import { useChat } from "../hooks/useChat.js";
import { apiRequest } from "../services/api.js";
import Message from "./Message.jsx";

const pathPrompt = {
  key: "concernType",
  text: "Which area should we focus on first: current stress, a trauma-related experience, or both?",
  suggestions: [
    "Mostly current stress and burnout",
    "Mostly trauma-related memories or reactions",
    "Both stress and trauma feel connected",
  ],
};

const pathPrompts = {
  stress: [
    {
      key: "stressSource",
      text: "What is the main source of stress affecting you right now?",
      suggestions: [
        "Work, academic, or deadline pressure",
        "Family, relationship, or caregiving pressure",
        "Money, health, or major life changes",
      ],
    },
    {
      key: "stressImpact",
      text: "How is this stress showing up in your body, mood, sleep, or daily routine?",
      suggestions: [
        "Tension, headaches, and fast heart rate",
        "Poor sleep, irritability, and low focus",
        "Feeling overwhelmed, exhausted, or burned out",
      ],
    },
    {
      key: "stressSupport",
      text: "What kind of stress support would feel most useful next?",
      suggestions: [
        "A calming routine I can use today",
        "A plan to reduce overload and triggers",
        "Guidance on when to seek professional support",
      ],
    },
  ],
  trauma: [
    {
      key: "traumaExperience",
      text: "What trauma-related experience or memory would you like support with today?",
      suggestions: [
        "Struggling with memories of a past event",
        "Feeling unsafe or constantly on edge after something happened",
        "Avoiding reminders because they feel overwhelming",
      ],
    },
    {
      key: "traumaReactions",
      text: "What reactions are you noticing now, such as nightmares, flashbacks, numbness, fear, or body tension?",
      suggestions: [
        "Intrusive memories, nightmares, or flashbacks",
        "Numbness, guilt, shame, fear, or anger",
        "Being jumpy, watchful, tense, or easily startled",
      ],
    },
    {
      key: "traumaSupport",
      text: "What kind of trauma support would feel most helpful next?",
      suggestions: [
        "Grounding steps for intense moments",
        "Understanding my trauma impact priority",
        "Action steps for professional trauma-informed care",
      ],
    },
  ],
  combined: [
    {
      key: "combinedSource",
      text: "What feels most connected for you right now: the stress load, the trauma reaction, or how they affect each other?",
      suggestions: [
        "Stress is making trauma reactions stronger",
        "Trauma reactions are making daily stress harder",
        "Both are affecting sleep, focus, and relationships",
      ],
    },
    {
      key: "combinedImpact",
      text: "How are stress and trauma symptoms affecting your body, emotions, sleep, work, school, or relationships?",
      suggestions: [
        "Overwhelmed, tense, and constantly alert",
        "Poor sleep plus intrusive memories or worry",
        "Avoidance, exhaustion, and trouble functioning",
      ],
    },
    {
      key: "combinedSupport",
      text: "What support would help most: stress reduction, trauma grounding, safety planning, or professional follow-up?",
      suggestions: [
        "Stress reduction and grounding exercises",
        "A clear care plan for both stress and trauma",
        "Professional follow-up and safety guidance",
      ],
    },
  ],
};

function classifyAssessmentPath(answerText) {
  const normalizedAnswer = answerText.toLowerCase();
  const traumaTerms = ["trauma", "memories", "flashback", "nightmare", "unsafe", "event", "reminder", "avoid"];
  const stressTerms = ["stress", "burnout", "work", "academic", "deadline", "pressure", "overload", "exhausted"];
  const hasTrauma = traumaTerms.some((term) => normalizedAnswer.includes(term));
  const hasStress = stressTerms.some((term) => normalizedAnswer.includes(term));

  if (normalizedAnswer.includes("both") || (hasStress && hasTrauma)) {
    return "combined";
  }

  if (hasTrauma) {
    return "trauma";
  }

  return "stress";
}

function getPromptSequence(assessmentPath) {
  return [
    pathPrompt,
    ...(pathPrompts[assessmentPath] || pathPrompts.stress),
  ];
}

function buildSessionDetails(messages, createdAt) {
  const userMessages = messages.filter((message) => message.sender === "user");
  const assistantMessages = messages.filter((message) => message.sender !== "user");

  return {
    createdAt,
    totalMessages: messages.length,
    userResponses: userMessages.length,
    assistantResponses: assistantMessages.length,
  };
}

function answersFromTranscript(transcript) {
  const firstUserMessage = transcript.find((message) => message.sender === "user");
  const assessmentPath = firstUserMessage
    ? classifyAssessmentPath(firstUserMessage.text)
    : "stress";
  const promptSequence = getPromptSequence(assessmentPath);

  return transcript
    .filter((message) => message.sender === "user")
    .reduce((currentAnswers, message, index) => {
      const promptKey = promptSequence[index]?.key || `response${index + 1}`;
      currentAnswers[promptKey] = message.text;
      return currentAnswers;
    }, {});
}

function buildFallbackFeedback(answers, assessmentPath) {
  const pathLabels = {
    stress: "Stress",
    trauma: "Trauma",
    combined: "Stress and Trauma",
  };
  const activePath = pathLabels[assessmentPath] ? assessmentPath : "stress";
  const safeAnswers = {
    ...answers,
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
      "Use guided breathing now: inhale for 4 seconds, hold for 4 seconds, exhale for 4 seconds, then rest for 4 seconds.",
      "Schedule a priority evaluation with a qualified mental health professional.",
    ],
    Moderate: [
      "Use a structured daily stress-management routine, including breathing practice twice daily.",
      "Track stress triggers, sleep, caffeine, and emotional spikes for a week.",
      "Set firm boundaries around work or study hours and take short sensory breaks.",
    ],
    Low: [
      "Maintain steady sleep, hydration, and light daily movement.",
      "Keep a short journal of grounding moments and stress-relief milestones.",
      "Review your care plan when new stressors appear.",
    ],
  };

  const summaries = {
    High: `Your responses suggest a high ${pathLabels[activePath].toLowerCase()} support priority, with signs of acute emotional or physical strain that may benefit from prompt support.`,
    Moderate: `Your responses suggest a moderate ${pathLabels[activePath].toLowerCase()} support priority, with noticeable distress that may improve with structured coping and follow-up.`,
    Low: `Your responses suggest a lower current ${pathLabels[activePath].toLowerCase()} priority, with manageable tension that may respond well to routine self-care and monitoring.`,
  };
  const answerValues = Object.values(safeAnswers).filter(Boolean);

  return {
    answers: safeAnswers,
    assessmentPath: activePath,
    riskLevel,
    stressLevel: activePath === "trauma" ? "Not primary" : riskLevel,
    traumaImpact: activePath === "stress" ? "Not primary" : riskLevel,
    summary: summaries[riskLevel],
    reportedConcerns: answerValues.slice(0, 2),
    possibleImpacts: answerValues.slice(1, 3),
    safetyNotes: isHigh
      ? "Some responses may need prompt safety attention. If there is immediate danger, contact local emergency support now."
      : "No immediate safety concern was clearly identified from these responses.",
    copingAndSupport: safeAnswers.support,
    recommendations: recommendations[riskLevel],
    nextSteps: [
      "Use one grounding or breathing exercise today.",
      "Consider sharing these results with a trusted support person or qualified professional.",
    ],
    backendReply: "Assessment completed. A fallback stress and trauma care plan was generated because the backend feedback service was unavailable.",
  };
}

export default function ChatBox({ onFeedback, onNavigate }) {
  const { messages, addMessage, resetMessages, setMessages } = useChat();
  const [draft, setDraft] = useState("");
  const [stepIndex, setStepIndex] = useState(0);
  const [assessmentPath, setAssessmentPath] = useState(null);
  const [answers, setAnswers] = useState({});
  const [isSending, setIsSending] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [error, setError] = useState("");

  const promptSequence = assessmentPath ? getPromptSequence(assessmentPath) : [pathPrompt];
  const currentPrompt = promptSequence[stepIndex] || promptSequence[promptSequence.length - 1];
  const hasUserResponse = messages.some((message) => message.sender === "user");

  const createFeedback = async (transcript, fallbackAnswers = answers, fallbackPath = assessmentPath || "stress") => {
    const createdAt = new Date().toISOString();

    try {
      const apiResponse = await apiRequest("/chat/feedback", {
        method: "POST",
        body: JSON.stringify({ messages: transcript }),
      });

      onFeedback({
        ...apiResponse.feedback,
        assessmentPath: apiResponse.feedback.assessmentPath || fallbackPath,
        answers: answersFromTranscript(transcript),
        transcript,
        sessionDetails: buildSessionDetails(transcript, createdAt),
        createdAt,
      });
    } catch (requestError) {
      console.warn("Backend feedback unavailable, using fallback feedback generator:", requestError);
      onFeedback({
        ...buildFallbackFeedback(fallbackAnswers, fallbackPath),
        transcript,
        sessionDetails: buildSessionDetails(transcript, createdAt),
        createdAt,
      });
    }

    onNavigate("feedback");
  };

  const submitAnswer = async (answerText) => {
    const trimmed = answerText.trim();
    if (!trimmed || isSending || isFinishing) return;

    const userMessage = { id: Date.now(), sender: "user", text: trimmed };
    const nextTranscript = [...messages, userMessage];
    const updatedAnswers = { ...answers, [currentPrompt.key]: trimmed };
    const nextAssessmentPath = assessmentPath || classifyAssessmentPath(trimmed);
    const nextPromptSequence = getPromptSequence(nextAssessmentPath);

    addMessage(userMessage);
    setAssessmentPath(nextAssessmentPath);
    setAnswers(updatedAnswers);
    setDraft("");
    setError("");

    if (stepIndex < nextPromptSequence.length - 1) {
      const nextStepIndex = stepIndex + 1;
      const botMessage = {
        id: Date.now() + 1,
        sender: "bot",
        text: nextPromptSequence[nextStepIndex].text,
      };

      setStepIndex(nextStepIndex);
      setTimeout(() => addMessage(botMessage), 200);
      return;
    }

    setIsSending(true);
    setIsFinishing(true);

    const closingMessage = {
      id: Date.now() + 1,
      sender: "bot",
      text: "Thank you. Analyzing your responses and generating your trauma and stress assessment feedback...",
    };
    const completedTranscript = [...nextTranscript, closingMessage];
    setMessages(completedTranscript);

    try {
      await createFeedback(completedTranscript, updatedAnswers, nextAssessmentPath);
    } catch (requestError) {
      setError(requestError.message || "The counselling API could not generate feedback.");
    } finally {
      setIsSending(false);
      setIsFinishing(false);
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
      await createFeedback(messages, answers, assessmentPath || "stress");
    } catch (requestError) {
      setError(requestError.message || "The counselling API could not generate feedback.");
    } finally {
      setIsFinishing(false);
    }
  };

  const handleReset = () => {
    resetMessages();
    setStepIndex(0);
    setAssessmentPath(null);
    setAnswers({});
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
              <span className="chat-title">Trauma & Stress Assessment Assistant</span>
              <span className="chat-online-badge">
                <span className="online-dot" /> Live Active
              </span>
            </div>
            <p className="chat-subtitle">Guided stress and trauma assessment paths</p>
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
        <div className="chat-progress-fill" style={{ width: `${((stepIndex + 1) / promptSequence.length) * 100}%` }} />
      </div>

      <div className="message-list">
        {messages.map((message) => (
          <Message key={message.id} role={message.sender}>
            {message.text}
          </Message>
        ))}
      </div>

      {!isSending && !isFinishing && (
        <div className="chat-suggestions">
          <span className="suggestion-label">Quick options:</span>
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

      <form className="chat-form" onSubmit={handleFormSubmit}>
        <input
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={isFinishing ? "Preparing feedback..." : "Type your response..."}
          aria-label="Type your response"
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
