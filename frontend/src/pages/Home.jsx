import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  HeartHandshake, 
  MessageSquareHeart, 
  Activity, 
  Stethoscope, 
  Lock, 
  Brain, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Flame,
  Zap,
  Wind
} from "lucide-react";
import ImageSlider from "../components/ImageSlider";
import BreathingTool from "../components/BreathingTool";

const emotionalStates = [
  {
    id: "stress",
    label: "High Stress & Work Overwhelm",
    risk: "Moderate Stress",
    riskClass: "moderate",
    tip: "Stress De-escalation: Step away from screens. Follow our interactive 4-7-8 box-breathing tool below to reduce adrenaline and cortisol."
  },
  {
    id: "burnout",
    label: "Burnout & Physical Fatigue",
    risk: "Moderate Priority",
    riskClass: "moderate",
    tip: "Energy Reset: Place your hands over your eyes for 30 seconds. Do a gentle neck stretch and drink a glass of fresh water."
  },
  {
    id: "panic",
    label: "Panic or Acute Anxiety",
    risk: "High Priority",
    riskClass: "high",
    tip: "Grounding exercise: Take 5 slow deep breaths. Look around and name 5 items in the room, touch 4 textures, listen for 3 ambient sounds."
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
    label: "Seeking Stress & Trauma Overview",
    risk: "Low Priority",
    riskClass: "low",
    tip: "Exploratory Care: Our guided assessment will gently ask 3 questions to generate personalized care and stress reduction suggestions."
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
  { icon: Lock, label: "100% Confidential", desc: "Private, anonymous assessment sessions" },
  { icon: Brain, label: "Trauma & Stress Care", desc: "Built with clinical care principles" },
  { icon: Sparkles, label: "Instant Analysis", desc: "Real-time risk priority classification" },
  { icon: CheckCircle2, label: "24/7 Available", desc: "Immediate access anytime you need" },
];

export default function Home({ onNavigate }) {
  const [selectedState, setSelectedState] = useState(emotionalStates[0]);
  const [activeWorkflow, setActiveWorkflow] = useState(1);

  return (
    <div className="home-container">
      {/* Dynamic Hero Slider */}
      <section className="hero-section">
        <ImageSlider onActionClick={onNavigate} />
      </section>

      {/* Interactive Trauma & Stress Quick Check-in Simulator */}
      <section className="interactive-checkin-card">
        <div className="section-header">
          <p className="eyebrow accent">Interactive Check-In</p>
          <h2 className="home-section-title">How are you feeling right now?</h2>
          <p className="home-section-desc">
            Select your current stress or emotional state for an instant coping technique and care priority preview.
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
                <strong>Recommended Immediate Relief Step:</strong>
                <p style={{ margin: "0.2rem 0 0" }}>{selectedState.tip}</p>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0.5rem" }}>
              <button
                type="button"
                className="primary-btn"
                onClick={() => onNavigate("chat")}
              >
                <span>Start Assessment</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </section>

      {/* Interactive Stress Relief Guided Breathing Tool */}
      <section>
        <BreathingTool />
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

      {/* Centered High-Impact Bottom Call To Action Banner */}
      <section className="cta-banner">
        <div className="cta-content">
          <h2>Ready for Your MindAssess Check-In?</h2>
          <p>
            Take the first step toward understanding your current support needs in a completely safe, private environment.
          </p>
          <div className="cta-actions">
            <button
              type="button"
              className="slider-btn primary"
              onClick={() => onNavigate("chat")}
            >
              Start Assessment
            </button>
            <button
              type="button"
              className="slider-btn secondary"
              onClick={() => onNavigate("feedback")}
            >
              View Feedback
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
