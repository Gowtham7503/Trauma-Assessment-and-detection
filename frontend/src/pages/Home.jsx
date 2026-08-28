import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, 
  MessageSquareHeart, 
  Activity, 
  HeartHandshake, 
  Sparkles, 
  ArrowRight, 
  PhoneCall, 
  CheckCircle2, 
  Brain, 
  Lock, 
  Stethoscope, 
  Flame 
} from "lucide-react";
import ImageSlider from "../components/ImageSlider";

const emotionalStates = [
  {
    id: "panic",
    label: "Panic or Acute Anxiety",
    risk: "Moderate to High",
    riskClass: "high",
    tip: "Grounding exercise: Take 5 slow deep breaths. Look around and name 5 items in the room, touch 4 textures, listen for 3 ambient sounds."
  },
  {
    id: "numb",
    label: "Feeling Numb or Detached",
    risk: "Moderate",
    riskClass: "moderate",
    tip: "Sensory reconnect: Place your feet firmly on the ground, drink a sip of cold water, or wrap yourself in a warm blanket."
  },
  {
    id: "flashbacks",
    label: "Intrusive Memories / Flashbacks",
    risk: "High Priority",
    riskClass: "high",
    tip: "Safe Orientation: Remind yourself out loud: 'I am safe here in the present moment. That event is in the past.'"
  },
  {
    id: "seeking",
    label: "Seeking Gentle Advice & Overview",
    risk: "Low Priority",
    riskClass: "low",
    tip: "Exploratory Care: Our guided chat will gently ask 3 questions to generate personalized care suggestions."
  }
];

const workflowSteps = [
  {
    id: 1,
    title: "1. Gentle First Contact",
    badge: "Emotional Safety",
    icon: HeartHandshake,
    detail: "Establishes a calm, non-judgmental atmosphere before inquiring about personal or sensitive experiences."
  },
  {
    id: 2,
    title: "2. Empathetic Inquiry",
    badge: "Structured Screening",
    icon: MessageSquareHeart,
    detail: "Gathers three short inputs: the situation, how you feel right now, and what support feels most helpful."
  },
  {
    id: 3,
    title: "3. Real-Time Risk Analysis",
    badge: "Clinical Triage",
    icon: Activity,
    detail: "Scans responses against clinical keywords to assign High, Moderate, or Low urgency priorities."
  },
  {
    id: 4,
    title: "4. Tailored Feedback Plan",
    badge: "Actionable Guidance",
    icon: Stethoscope,
    detail: "Delivers immediate grounding steps, coping strategies, and follow-up directives for healthcare providers."
  }
];

const trustMetrics = [
  { icon: Lock, label: "100% Confidential", desc: "Private, anonymous chat sessions" },
  { icon: Brain, label: "Trauma-Informed", desc: "Built with clinical care principles" },
  { icon: Sparkles, label: "Instant Analysis", desc: "Real-time risk priority classification" },
  { icon: CheckCircle2, label: "24/7 Available", desc: "Immediate access anytime you need" },
];

export default function Home({ onNavigate }) {
  const [selectedState, setSelectedState] = useState(emotionalStates[0]);
  const [activeWorkflow, setActiveWorkflow] = useState(1);

  return (
    <div className="home-container">
      {/* 24/7 Emergency & Safety Banner */}
      <section className="crisis-banner">
        <div className="crisis-banner-content">
          <div className="pulse-dot" />
          <span>Need Immediate Crisis Support? If you or someone you know is in danger, help is available 24/7.</span>
        </div>
        <div className="crisis-phone-tag">
          <PhoneCall size={16} />
          <span>Call or Text 988</span>
        </div>
      </section>

      {/* Dynamic Hero Slider */}
      <section className="hero-section">
        <ImageSlider onActionClick={onNavigate} />
      </section>

      {/* Interactive Trauma Diagnostic Quick Check-in Simulator */}
      <section className="interactive-checkin-card">
        <div className="section-header">
          <p className="eyebrow accent">Interactive Check-In</p>
          <h2 className="home-section-title">How are you feeling right now?</h2>
          <p className="home-section-desc">
            Select your current emotional state for an instant coping technique and risk priority preview.
          </p>
        </div>

        <div className="emotion-chips">
          {emotionalStates.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`emotion-chip ${selectedState.id === item.id ? "active" : ""}`}
              onClick={() => setSelectedState(item)}
            >
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={selectedState.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="diagnostic-preview-box"
          >
            <div className="preview-risk-indicator">
              <div>
                <span className="eyebrow">Estimated Care Priority</span>
                <h3 style={{ margin: "0.2rem 0 0", color: "#09131d" }}>{selectedState.label}</h3>
              </div>
              <span className={`risk-pill ${selectedState.riskClass}`}>
                {selectedState.risk}
              </span>
            </div>

            <div className="coping-tip-box">
              <Flame size={20} style={{ shrink: 0, marginTop: "2px" }} />
              <div>
                <strong>Recommended Immediate Grounding Step:</strong>
                <p style={{ margin: "0.2rem 0 0" }}>{selectedState.tip}</p>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0.5rem" }}>
              <button
                type="button"
                className="primary-btn"
                onClick={() => onNavigate("chat")}
              >
                <span>Start Full Trauma Assessment</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </section>

      {/* Trust & Safety Features */}
      <section className="stats-grid" style={{ marginTop: "3.5rem" }}>
        {trustMetrics.map((item) => {
          const IconComp = item.icon;
          return (
            <article key={item.label} className="stat-card">
              <div className="stat-icon-wrap">
                <IconComp size={24} />
              </div>
              <div className="stat-info">
                <strong>{item.label}</strong>
                <span>{item.desc}</span>
              </div>
            </article>
          );
        })}
      </section>

      {/* Interactive Workflow Step Tabs */}
      <section className="workflow-section">
        <div className="section-header">
          <p className="eyebrow accent">How It Works</p>
          <h2 className="home-section-title">A Gentle 4-Step Assessment Workflow</h2>
          <p className="home-section-desc">
            Designed to guide you thoughtfully from first contact to personalized feedback.
          </p>
        </div>

        <div className="workflow-tabs">
          {workflowSteps.map((step) => {
            const IconComp = step.icon;
            const isActive = activeWorkflow === step.id;
            return (
              <div
                key={step.id}
                className={`workflow-tab-card ${isActive ? "active" : ""}`}
                onClick={() => setActiveWorkflow(step.id)}
              >
                <div className="workflow-step-num">{step.badge}</div>
                <div className="info-card-header">
                  <div className="info-card-icon">
                    <IconComp size={22} />
                  </div>
                  <h3>{step.title}</h3>
                </div>
                <p>{step.detail}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* High-Impact Call To Action Banner */}
      <section className="cta-banner">
        <div className="cta-content">
          <h2>Ready for a Gentle Trauma Assessment?</h2>
          <p>
            Take the first step toward understanding your current support needs in a completely safe, private environment.
          </p>
        </div>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <button
            type="button"
            className="slider-btn primary"
            onClick={() => onNavigate("chat")}
          >
            Start Trauma Chat
          </button>
          <button
            type="button"
            className="slider-btn secondary"
            onClick={() => onNavigate("feedback")}
          >
            View Feedback
          </button>
        </div>
      </section>
    </div>
  );
}
