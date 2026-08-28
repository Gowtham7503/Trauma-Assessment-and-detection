export default function Feedback({ feedback, onNavigate }) {
  if (!feedback) {
    return (
      <section className="feedback-panel empty-state">
        <p className="eyebrow accent">Feedback</p>
        <h1>No feedback yet</h1>
        <p className="lead">
          Complete the trauma chat first. Your summarized feedback will appear here after the
          backend request returns.
        </p>
        <button type="button" className="primary-btn" onClick={() => onNavigate("chat")}>
          Open chat
        </button>
      </section>
    );
  }

  return (
    <section className="feedback-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow accent">Feedback</p>
          <h1>Assessment feedback</h1>
          <p className="lead">
            Review the person&apos;s submitted inputs and the generated support guidance.
          </p>
        </div>
        <span className={`risk-pill ${feedback.riskLevel.toLowerCase()}`}>
          {feedback.riskLevel} priority
        </span>
      </div>

      <div className="feedback-grid">
        <article className="feedback-card feedback-card--red">
          <p className="eyebrow">Support summary</p>
          <h2>{feedback.summary}</h2>
          <p>{feedback.backendReply}</p>
        </article>

        <article className="feedback-card">
          <p className="eyebrow">Suggested next steps</p>
          <ul className="check-list">
            {feedback.recommendations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className="feedback-card full-width">
          <p className="eyebrow">Inputs received</p>
          <dl className="detail-list">
            {Object.entries(feedback.answers).map(([key, value], index) => (
              <div key={key}>
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
