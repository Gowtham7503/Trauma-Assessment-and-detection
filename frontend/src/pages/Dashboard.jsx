import RiskCard from "../components/RiskCard.jsx";
import StressMeter from "../components/StressMeter.jsx";

const caseCards = [
  { name: "Ava Lewis", risk: "Moderate", score: 6, time: "Updated 18 mins ago" },
  { name: "Marcus Chen", risk: "High", score: 9, time: "Updated 1 hr ago" },
  { name: "Nia Patel", risk: "Low", score: 2, time: "Updated today" },
];

export default function Dashboard() {
  return (
    <section className="dashboard-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow accent">Operations</p>
          <h1>Care dashboard</h1>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-main">
          <div className="stats-grid compact">
            <article className="stat-card">
              <span>Pending reviews</span>
              <strong>7</strong>
            </article>
            <article className="stat-card">
              <span>Active follow-ups</span>
              <strong>12</strong>
            </article>
            <article className="stat-card">
              <span>Escalations</span>
              <strong>3</strong>
            </article>
          </div>

          <div className="case-list">
            {caseCards.map((caseItem) => (
              <article key={caseItem.name} className="case-item">
                <div>
                  <h3>{caseItem.name}</h3>
                  <p>{caseItem.time}</p>
                </div>
                <RiskCard risk={caseItem.risk} score={caseItem.score} compact />
              </article>
            ))}
          </div>
        </div>

        <aside className="side-panel">
          <StressMeter value={74} label="Support load" />
          <div className="info-card small">
            <h3>Priority actions</h3>
            <ul className="check-list">
              <li>Confirm safety check-in for Marcus</li>
              <li>Review Ava referral readiness</li>
              <li>Schedule follow-up for Nia</li>
            </ul>
          </div>
        </aside>
      </div>
    </section>
  );
}

