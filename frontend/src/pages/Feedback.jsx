import { ShieldCheck, CheckCircle2, FileText, ArrowRight, AlertTriangle } from "lucide-react";

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
          Please complete the 3-step Trauma Assessment first. Your summarized risk priority and personalized recommendations will appear here automatically.
        </p>
        <button
          type="button"
          className="primary-btn"
          onClick={() => onNavigate("chat")}
          style={{ marginTop: "1rem" }}
        >
          <span>Start Trauma Assessment</span>
          <ArrowRight size={18} />
        </button>
      </section>
    );
  }

  const riskLevel = feedback.riskLevel || "Unclear";
  const isHigh = riskLevel.toLowerCase() === "high";

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
            Review your responses, estimated risk priority level, and suggested immediate coping steps.
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
          <h2>{feedback.summary}</h2>
          <p style={{ marginTop: "0.5rem", color: "#64748b" }}>{feedback.backendReply}</p>
        </article>

        <article className="feedback-card">
          <p className="eyebrow">Reported Concerns</p>
          <ResultList items={feedback.reportedConcerns} />
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
          <p className="eyebrow">Suggested Action Steps</p>
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
            {Object.entries(feedback.answers).map(([key, value], index) => (
              <div key={key} className="detail-row">
                <dt>Response {index + 1}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </article>
      </div>
    </section>
  );
}
