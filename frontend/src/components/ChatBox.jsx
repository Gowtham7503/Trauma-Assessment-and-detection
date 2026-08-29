import { useEffect, useRef, useState } from "react";
import { HeartPulse, Loader2, Mic, RefreshCw, Send } from "lucide-react";
import { useChat } from "../hooks/useChat.js";
import { apiRequest } from "../services/api.js";
import Message from "./Message.jsx";

const initialPrompt = {
  key: "overview",
  text: "What is the main reason you are seeking support today? You can mention current stress, something upsetting that happened, or both.",
  suggestions: [
    "I feel stressed or overwhelmed right now",
    "I am struggling after something that happened",
    "Stress and past experiences both affect me",
  ],
};

const assessmentPrompts = {
  safety: {
    key: "safety",
    text: "Before we continue, do you feel safe right now, or is there any immediate risk of harm to you or someone else?",
    suggestions: [
      "I am safe right now",
      "I feel unsafe and need help",
      "I am not sure if I am safe",
    ],
  },
  stressSymptoms: {
    key: "stressSymptoms",
    text: "When you feel stressed, what do you notice most in your body, thoughts, mood, sleep, or daily routine?",
    suggestions: [
      "My sleep or energy has changed",
      "My body feels tense, restless, or panicky",
      "I feel overwhelmed, irritated, or unable to focus",
    ],
  },
  stressSource: {
    key: "stressSource",
    text: "What is causing most of the stress right now? Choose the closest option, or write your own answer.",
    suggestions: [
      "Work, school, exams, or deadlines",
      "Family, relationship, or caregiving responsibilities",
      "Money, health, housing, or another big life change",
    ],
  },
  traumaExperience: {
    key: "traumaExperience",
    text: "Has any frightening, harmful, or upsetting experience been affecting you recently or coming back into your mind?",
    suggestions: [
      "Yes, memories of an event keep coming back",
      "I avoid reminders because they feel overwhelming",
      "No trauma-related experience is affecting me now",
    ],
  },
  traumaReactions: {
    key: "traumaReactions",
    text: "Are you noticing trauma-related reactions like intrusive memories, nightmares, flashbacks, numbness, guilt, fear, anger, being on edge, or avoiding reminders?",
    suggestions: [
      "Intrusive memories, nightmares, or flashbacks",
      "Numbness, guilt, fear, anger, or shame",
      "Being alert, jumpy, tense, or avoidant",
    ],
  },
  functioning: {
    key: "functioning",
    text: "How is this affecting your day-to-day life, such as work, school, relationships, self-care, sleep, or responsibilities?",
    suggestions: [
      "It is affecting sleep and concentration",
      "It is affecting work, school, or responsibilities",
      "It is affecting relationships or self-care",
    ],
  },
  duration: {
    key: "duration",
    text: "How long has this been going on, and how often does it affect you?",
    suggestions: [
      "A few days or weeks",
      "Several weeks or months",
      "It happens often or most days",
    ],
  },
  support: {
    key: "support",
    text: "What kind of support would help most next?",
    suggestions: [
      "Calming exercises and stress reduction",
      "Grounding and coping steps",
      "Professional follow-up or safety guidance",
    ],
  },
};

const promptOrder = [
  "safety",
  "stressSymptoms",
  "stressSource",
  "traumaExperience",
  "traumaReactions",
  "functioning",
  "duration",
  "support",
];

const promptOrdersByPath = {
  stress: ["stressSymptoms", "stressSource", "functioning", "duration", "support"],
  trauma: ["traumaExperience", "traumaReactions", "safety", "functioning", "duration", "support"],
  combined: promptOrder,
};

const assessmentPathLabels = {
  stress: "stress",
  trauma: "trauma",
  combined: "stress and trauma",
};

const assessmentPathIntros = {
  stress: "Thanks. I will continue with stress-focused questions.",
  trauma: "Thanks. I will continue with trauma-focused questions.",
  combined: "Thanks. I will continue with questions about both stress and trauma.",
};

const safetyTerms = ["unsafe", "danger", "suicide", "self harm", "hurt myself", "hurt someone", "harm", "abuse", "threat"];
const traumaTerms = ["trauma", "memories", "memory", "incident", "flashback", "nightmare", "unsafe", "event", "happened", "upsetting", "past experience", "past experiences", "reminder", "avoid", "avoiding", "attacked", "attack", "assault", "abuse", "violence", "scared", "fear", "guilt", "shame", "numb", "startle", "footsteps"];
const stressTerms = ["stress", "stressed", "burnout", "work", "academic", "deadline", "pressure", "overload", "exhausted", "tension", "sleep", "irritable", "worry", "panic", "focus"];
const combinedTerms = ["both", "stress and trauma", "trauma and stress", "stress and past", "stress with past"];
const noTraumaTerms = ["no trauma", "not trauma", "no traumatic", "nothing happened"];

function hasAnyTerm(text, terms) {
  const normalizedText = text.toLowerCase();

  return terms.some((term) => normalizedText.includes(term));
}

function detectSignals(answerText) {
  const normalizedAnswer = answerText.toLowerCase();

  return {
    hasSafetyConcern: hasAnyTerm(normalizedAnswer, safetyTerms),
    hasStress: hasAnyTerm(normalizedAnswer, stressTerms),
    hasTrauma: hasAnyTerm(normalizedAnswer, traumaTerms) && !hasAnyTerm(normalizedAnswer, noTraumaTerms),
  };
}

function detectAssessmentPath(answerText) {
  const signals = detectSignals(answerText);

  if ((signals.hasStress && signals.hasTrauma) || hasAnyTerm(answerText, combinedTerms)) {
    return "combined";
  }

  if (signals.hasTrauma) {
    return "trauma";
  }

  return "stress";
}

function chooseNextPrompt(currentAnswers, latestAnswer, assessmentPath = "combined") {
  const signals = detectSignals(latestAnswer);
  const activePromptOrder = promptOrdersByPath[assessmentPath] || promptOrdersByPath.combined;

  if (signals.hasSafetyConcern && !currentAnswers.safety) {
    return assessmentPrompts.safety;
  }

  if (assessmentPath !== "stress" && signals.hasTrauma) {
    if (!currentAnswers.traumaExperience) {
      return assessmentPrompts.traumaExperience;
    }

    if (!currentAnswers.traumaReactions) {
      return assessmentPrompts.traumaReactions;
    }
  }

  if (signals.hasStress && !currentAnswers.stressSymptoms) {
    return assessmentPrompts.stressSymptoms;
  }

  const nextPromptKey = activePromptOrder.find((promptKey) => !currentAnswers[promptKey]);

  return nextPromptKey ? assessmentPrompts[nextPromptKey] : null;
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
  return transcript
    .filter((message) => message.sender === "user")
    .reduce((currentAnswers, message, index) => {
      const promptKey = message.promptKey || [initialPrompt.key, ...promptOrder][index] || `response${index + 1}`;
      currentAnswers[promptKey] = message.text;
      return currentAnswers;
    }, {});
}

function levelFromTerms(text, highTerms, moderateTerms) {
  const normalizedText = text.toLowerCase();
  const isHigh = highTerms.some((term) => normalizedText.includes(term));
  const isModerate = moderateTerms.some((term) => normalizedText.includes(term));

  return isHigh ? "High" : isModerate ? "Moderate" : "Low";
}

function buildFallbackFeedback(answers, assessmentPath = "combined") {
  const pathLabels = {
    stress: "Stress",
    trauma: "Trauma",
    combined: "Stress and Trauma",
  };
  const safeAnswers = {
    ...answers,
  };
  const activePath = pathLabels[assessmentPath] ? assessmentPath : "combined";
  const combinedText = Object.values(safeAnswers).join(" ").toLowerCase();
  const urgentTerms = ["unsafe", "suicide", "self harm", "hurt myself", "danger", "attacked", "assault", "panic", "flashback", "nightmare", "severe", "exhausted", "burnout"];
  const moderateTerms = ["scared", "fear", "anxiety", "memories", "incident", "avoid", "stress", "tension", "headaches", "work", "overwhelmed", "alone", "numb", "detached"];
  const riskLevel = levelFromTerms(combinedText, urgentTerms, moderateTerms);
  const isHigh = riskLevel === "High";
  const stressLevel = levelFromTerms(
    [safeAnswers.overview, safeAnswers.stressSymptoms, safeAnswers.stressSource, safeAnswers.functioning].join(" "),
    ["panic", "severe", "exhausted", "burnout", "unable", "most days"],
    ["stress", "stressed", "pressure", "overwhelmed", "tension", "headaches", "sleep", "work", "worry"]
  );
  const traumaImpact = levelFromTerms(
    [safeAnswers.overview, safeAnswers.traumaExperience, safeAnswers.traumaReactions, safeAnswers.functioning].join(" "),
    ["unsafe", "attacked", "assault", "flashback", "nightmare", "danger", "severe", "most days"],
    ["trauma", "memories", "incident", "avoid", "scared", "fear", "numb", "guilt", "shame", "edge", "startle", "footsteps"]
  );

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
    stressLevel: activePath === "trauma" ? "Not primary" : stressLevel,
    traumaImpact: activePath === "stress" ? "Not primary" : traumaImpact,
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
    backendReply: `Assessment completed. A fallback ${pathLabels[activePath].toLowerCase()} care plan was generated because the backend feedback service was unavailable.`,
  };
}

function normalizeFeedback(feedback, transcript, createdAt, assessmentPath = "combined") {
  const normalizedFeedback = {
    ...feedback,
    assessmentPath,
    answers: answersFromTranscript(transcript),
    transcript,
    sessionDetails: buildSessionDetails(transcript, createdAt),
    createdAt,
  };

  if (assessmentPath === "trauma") {
    normalizedFeedback.stressLevel = "Not primary";
  } else if (!normalizedFeedback.stressLevel || String(normalizedFeedback.stressLevel).toLowerCase().includes("not primary")) {
    normalizedFeedback.stressLevel = "Unclear";
  }

  if (assessmentPath === "stress") {
    normalizedFeedback.traumaImpact = "Not primary";
  } else if (!normalizedFeedback.traumaImpact || String(normalizedFeedback.traumaImpact).toLowerCase().includes("not primary")) {
    normalizedFeedback.traumaImpact = "Unclear";
  }

  const priorityRank = {
    low: 1,
    unclear: 2,
    moderate: 3,
    high: 4,
  };
  const levels = [
    normalizedFeedback.riskLevel,
    normalizedFeedback.stressLevel,
    normalizedFeedback.traumaImpact,
  ];
  const highestLevel = levels.reduce((currentHighest, level) => {
    const normalizedLevel = String(level || "Unclear").toLowerCase();
    const currentRank = priorityRank[String(currentHighest).toLowerCase()] || 0;
    const nextRank = priorityRank[normalizedLevel] || 0;

    return nextRank > currentRank ? level : currentHighest;
  }, "Unclear");

  normalizedFeedback.riskLevel = highestLevel;

  return normalizedFeedback;
}

export default function ChatBox({ onFeedback, onNavigate }) {
  const { messages, addMessage, resetMessages, setMessages } = useChat();
  const [draft, setDraft] = useState("");
  const [currentPrompt, setCurrentPrompt] = useState(initialPrompt);
  const [answers, setAnswers] = useState({});
  const [assessmentPath, setAssessmentPath] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [supportsSpeechInput, setSupportsSpeechInput] = useState(false);
  const [error, setError] = useState("");
  const [speechError, setSpeechError] = useState("");
  const recognitionRef = useRef(null);
  const shouldKeepListeningRef = useRef(false);
  const speechBaseDraftRef = useRef("");
  const draftInputRef = useRef(null);

  const hasUserResponse = messages.some((message) => message.sender === "user");
  const activePromptOrder = promptOrdersByPath[assessmentPath] || promptOrdersByPath.combined;
  const progressPercent = Math.min(
    100,
    ((Object.keys(answers).length + 1) / (activePromptOrder.length + 1)) * 100
  );

  useEffect(() => {
    const draftInput = draftInputRef.current;

    if (!draftInput) {
      return;
    }

    draftInput.style.height = "auto";
    draftInput.style.height = `${draftInput.scrollHeight}px`;
  }, [draft]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
      setSpeechError("");
    };

    recognition.onend = () => {
      setIsListening(false);

      if (shouldKeepListeningRef.current) {
        try {
          recognition.start();
        } catch {
          shouldKeepListeningRef.current = false;
        }
      }
    };

    recognition.onerror = (event) => {
      setIsListening(false);

      if (event.error === "aborted" || event.error === "no-speech") {
        return;
      }

      shouldKeepListeningRef.current = false;
      setSpeechError("Voice input could not be captured. Please check microphone access.");
    };

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join(" ")
        .trim();
      const baseDraft = speechBaseDraftRef.current;

      setDraft(`${baseDraft}${baseDraft && transcript ? " " : ""}${transcript}`.trim());
    };

    recognitionRef.current = recognition;
    setSupportsSpeechInput(true);

    return () => {
      shouldKeepListeningRef.current = false;
      recognition.stop();
      recognitionRef.current = null;
    };
  }, []);

  const createFeedback = async (transcript, fallbackAnswers = answers, fallbackPath = assessmentPath || "combined") => {
    const createdAt = new Date().toISOString();

    try {
      const apiResponse = await apiRequest("/chat/feedback", {
        method: "POST",
        body: JSON.stringify({ messages: transcript, assessmentPath: fallbackPath }),
      });

      onFeedback(normalizeFeedback(apiResponse.feedback, transcript, createdAt, fallbackPath));
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

    shouldKeepListeningRef.current = false;
    recognitionRef.current?.stop();

    const userMessage = { id: Date.now(), sender: "user", text: trimmed, promptKey: currentPrompt.key };
    const nextTranscript = [...messages, userMessage];
    const updatedAnswers = { ...answers, [currentPrompt.key]: trimmed };
    const nextAssessmentPath = assessmentPath || detectAssessmentPath(trimmed);
    const nextPrompt = chooseNextPrompt(updatedAnswers, trimmed, nextAssessmentPath);

    addMessage(userMessage);
    setAnswers(updatedAnswers);
    setAssessmentPath(nextAssessmentPath);
    setDraft("");
    setError("");

    if (nextPrompt) {
      const shouldShowPathIntro = currentPrompt.key === initialPrompt.key;
      const botMessage = {
        id: Date.now() + 1,
        sender: "bot",
        text: shouldShowPathIntro
          ? `${assessmentPathIntros[nextAssessmentPath]} ${nextPrompt.text}`
          : nextPrompt.text,
      };

      setCurrentPrompt(nextPrompt);
      setTimeout(() => addMessage(botMessage), 200);
      return;
    }

    setIsSending(true);
    setIsFinishing(true);

    const closingMessage = {
      id: Date.now() + 1,
      sender: "bot",
      text: `Thank you. Analyzing your responses and generating your ${assessmentPathLabels[nextAssessmentPath]} assessment feedback...`,
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

  const handleDraftKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submitAnswer(event.currentTarget.value);
    }
  };

  const handleDraftBeforeInput = (event) => {
    if (event.inputType === "insertLineBreak") {
      event.preventDefault();
      submitAnswer(event.currentTarget.value);
    }
  };

  const handleVoiceInput = () => {
    if (!recognitionRef.current || isSending || isFinishing) {
      return;
    }

    if (isListening) {
      shouldKeepListeningRef.current = false;
      recognitionRef.current.stop();
      return;
    }

    speechBaseDraftRef.current = draft.trim();
    shouldKeepListeningRef.current = true;
    setSpeechError("");

    try {
      recognitionRef.current.start();
    } catch {
      shouldKeepListeningRef.current = false;
      setSpeechError("Voice input is already active.");
    }
  };

  const handleFinish = async () => {
    if (!hasUserResponse || isFinishing) return;

    shouldKeepListeningRef.current = false;
    recognitionRef.current?.stop();
    setError("");
    setIsFinishing(true);

    try {
      await createFeedback(messages, answers, assessmentPath || "combined");
    } catch (requestError) {
      setError(requestError.message || "The counselling API could not generate feedback.");
    } finally {
      setIsFinishing(false);
    }
  };

  const handleReset = () => {
    shouldKeepListeningRef.current = false;
    recognitionRef.current?.stop();
    resetMessages();
    setCurrentPrompt(initialPrompt);
    setAnswers({});
    setAssessmentPath(null);
    setDraft("");
    setError("");
    setSpeechError("");
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
              <span className="chat-title">MindAssess Assistant</span>
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
        <div className="chat-progress-fill" style={{ width: `${progressPercent}%` }} />
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
        <textarea
          ref={draftInputRef}
          rows={1}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBeforeInput={handleDraftBeforeInput}
          onKeyDown={handleDraftKeyDown}
          placeholder={isListening ? "Listening..." : isFinishing ? "Preparing feedback..." : "Type your response..."}
          aria-label="Type your response"
          disabled={isSending || isFinishing}
        />
        <button
          type="button"
          className={`mic-btn ${isListening ? "active" : ""}`}
          onClick={handleVoiceInput}
          disabled={isSending || isFinishing || !supportsSpeechInput}
          aria-label={isListening ? "Stop voice input" : "Start voice input"}
          aria-pressed={isListening}
          title={supportsSpeechInput ? "Voice input" : "Voice input is not supported in this browser"}
        >
          <Mic size={18} />
        </button>
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
      {speechError && <p className="form-error">{speechError}</p>}
    </div>
  );
}
