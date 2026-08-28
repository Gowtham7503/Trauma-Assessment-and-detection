const timeline = [
  { title: "Initial intake completed", detail: "Client reported sleep disruption and emotional overwhelm." },
  { title: "Safety review scheduled", detail: "Follow-up with a clinician planned for later this afternoon." },
  { title: "Support plan updated", detail: "Coping strategies reviewed with family support and check-ins." },
];

export default function CaseDetails() {
  return (
    <section className="case-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow accent">Case profile</p>
          <h1>Ava Lewis</h1>
        </div>
        <span className="risk-pill moderate">Moderate</span>
      </div>

      <div className="case-grid">
        <article className="info-card large">
          <h3>Client overview</h3>
          <dl className="detail-list">
            <div>
              <dt>Age</dt>
              <dd>29</dd>
            </div>
            <div>
              <dt>Primary concern</dt>
              <dd>Persistent flashbacks</dd>
            </div>
            <div>
              <dt>Support status</dt>
              <dd>Weekly check-in active</dd>
            </div>
          </dl>
        </article>

        <article className="info-card large">
          <h3>Clinical notes</h3>
          <p>
            Client reports improved grounding techniques and lower daytime distress. Continued
            observation recommended due to stress reactivity during routine triggers.
          </p>
        </article>
      </div>

      <article className="info-card full-width">
        <h3>Timeline</h3>
        <ul className="timeline">
          {timeline.map((event) => (
            <li key={event.title}>
              <strong>{event.title}</strong>
              <span>{event.detail}</span>
            </li>
          ))}
        </ul>
      </article>
    </section>
  );
}

