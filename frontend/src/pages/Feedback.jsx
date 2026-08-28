import { ShieldCheck, CheckCircle2, FileText, ArrowRight, AlertTriangle } from "lucide-react";
import BreathingTool from "../components/BreathingTool";

function ResultList({ items }) {
  if (!Array.isArray(items) || items.length === 0) {
    return <p style={{ color: "#64748b" }}>No specific items were identified from the conversation.</p>;
  }

  return (
    <ul className="check-list">
      {items.map((item) => (
        <li key={item} className="check-item">
          <CheckCircle2 size={18} className="check-icon" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function normalizeAssessmentPath(path) {
  const normalizedPath = String(path || "").toLowerCase();

  if (normalizedPath.includes("combined") || normalizedPath.includes("both")) {
    return "combined";
  }

  if (normalizedPath.includes("trauma")) {
    return "trauma";
  }

  if (normalizedPath.includes("stress")) {
    return "stress";
  }

  return "combined";
}

function normalizeLevel(level) {
  const normalizedLevel = String(level || "Unclear").toLowerCase();

  if (normalizedLevel.includes("not primary")) {
    return "notPrimary";
  }

  if (normalizedLevel.includes("high")) {
    return "high";
  }

  if (normalizedLevel.includes("moderate")) {
    return "moderate";
  }

  if (normalizedLevel.includes("low")) {
    return "low";
  }

  return "unclear";
}

function levelLabel(level) {
  const labels = {
    low: "Low",
    moderate: "Moderate",
    high: "High",
    unclear: "Unclear",
    notPrimary: "Not primary",
  };

  return labels[normalizeLevel(level)];
}

function levelPercent(level) {
  const values = {
    low: 30,
    moderate: 62,
    high: 92,
    unclear: 48,
    notPrimary: 16,
  };

  return values[normalizeLevel(level)];
}

function LevelBar({ label, level }) {
  const normalizedLevel = normalizeLevel(level);

  return (
    <div className="level-meter">
      <div className="level-meter-header">
        <span>{label}</span>
        <strong>{levelLabel(level)}</strong>
      </div>
      <div className="level-meter-track" aria-label={`${label}: ${levelLabel(level)}`}>
        <div
          className={`level-meter-fill ${normalizedLevel}`}
          style={{ width: `${levelPercent(level)}%` }}
        />
      </div>
    </div>
  );
}

export default function Feedback({ feedback, onNavigate }) {
  if (!feedback) {
    return (
      <section className="feedback-panel empty-state">
        <div className="badge-pill">
          <ShieldCheck size={16} />
          <span>Assessment Results</span>
        </div>
        <h1 style={{ marginTop: "0.5rem" }}>No Feedback Generated Yet</h1>
        <p className="lead">
          Please complete the stress and trauma assessment first. Your summarized risk priority and personalized recommendations will appear here automatically.
        </p>
        <button
          type="button"
          className="primary-btn"
          onClick={() => onNavigate("chat")}
          style={{ marginTop: "1rem" }}
        >
          <span>Start Assessment</span>
          <ArrowRight size={18} />
        </button>

        <div style={{ width: "100%", marginTop: "2rem" }}>
          <BreathingTool />
        </div>
      </section>
    );
  }

  const riskLevel = feedback.riskLevel || "Unclear";
  const isHigh = riskLevel.toLowerCase() === "high";
  const pathLabels = {
    stress: "Stress",
    trauma: "Trauma",
    combined: "Stress and Trauma",
  };
  const normalizedPath = normalizeAssessmentPath(feedback.assessmentPath);
  const assessmentPath = pathLabels[normalizedPath];
  const stressLevel = feedback.stressLevel || (normalizedPath === "trauma" ? "Not primary" : riskLevel);
  const traumaImpact = feedback.traumaImpact || (normalizedPath === "stress" ? "Not primary" : riskLevel);

  return (
    <section className="feedback-panel">
      <div className="section-heading">
        <div>
          <div className="badge-pill">
            <ShieldCheck size={16} />
            <span>Clinical Summary</span>
          </div>
          <h1 style={{ marginTop: "0.5rem" }}>Assessment Feedback & Care Plan</h1>
          <p className="lead">
            Review your responses, assessment path, estimated priority level, and suggested immediate coping steps.
          </p>
        </div>
        <span className={`risk-pill ${riskLevel.toLowerCase()}`}>
          {isHigh && <AlertTriangle size={16} />}
          <span>{riskLevel} Priority</span>
        </span>
      </div>

      <div className="feedback-grid">
        <article className="feedback-card feedback-card--red">
          <p className="eyebrow">Support Summary</p>
          <p className="summary-report">{feedback.summary}</p>
          <p className="summary-note">{feedback.backendReply}</p>
        </article>

        <article className="feedback-card">
          <p className="eyebrow">Assessment Path</p>
          <h2>{assessmentPath}</h2>
          <div className="level-meter-group">
            <LevelBar label="Stress Level" level={stressLevel} />
            <LevelBar label="Trauma Impact" level={traumaImpact} />
          </div>
        </article>

        <article className="feedback-card">
          <p className="eyebrow">Possible Impacts</p>
          <ResultList items={feedback.possibleImpacts} />
        </article>

        <article className="feedback-card">
          <p className="eyebrow">Safety Notes</p>
          <p style={{ color: "#475569" }}>
            {feedback.safetyNotes || "No safety notes were generated from the conversation."}
          </p>
        </article>

        <article className="feedback-card">
          <p className="eyebrow">Coping & Support</p>
          <p style={{ color: "#475569" }}>
            {feedback.copingAndSupport || "No coping or support details were generated from the conversation."}
          </p>
        </article>

        <article className="feedback-card">
          <p className="eyebrow">Reported Concerns</p>
          <ResultList items={feedback.reportedConcerns} />
        </article>

        <article className="feedback-card">
          <p className="eyebrow">Suggested Action Steps & Stress Relief</p>
          <ResultList items={feedback.recommendations} />
        </article>

        <article className="feedback-card">
          <p className="eyebrow">Next Steps</p>
          <ResultList items={feedback.nextSteps} />
        </article>

        <article className="feedback-card full-width">
          <p className="eyebrow" style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <FileText size={16} />
            <span>Submitted Responses</span>
          </p>
          <dl className="detail-list">
            {Object.entries(feedback.answers || {}).map(([key, value], index) => (
              <div key={key} className="detail-row">
                <dt>{key.startsWith("response") ? `Response ${index + 1}` : key}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </article>
      </div>

      {/* Embedded Guided Breathing & Stress Relief Toolkit */}
      <section style={{ marginTop: "3rem" }}>
        <BreathingTool />
      </section>
    </section>
  );
}
