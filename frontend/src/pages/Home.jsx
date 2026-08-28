import RiskCard from "../components/RiskCard.jsx";
import StressMeter from "../components/StressMeter.jsx";

const quickStats = [
  { label: "Open cases", value: "18" },
  { label: "High-risk alerts", value: "4" },
  { label: "Response time", value: "12 min" },
];

export default function Home({ onNavigate }) {
  return (
    <>
      <section className="hero-panel">
        <div className="hero-copy">
          <p className="eyebrow accent">Trauma-informed care</p>
          <h1>Clinical support without losing the human connection.</h1>
          <p className="lead">
            Review risk indicators, respond with empathy, and coordinate care for each person
            with a clear, structured assessment flow.
          </p>
          <div className="hero-actions">
            <button type="button" className="primary-btn" onClick={() => onNavigate("assessment")}>
              Start assessment
            </button>
            <button type="button" className="secondary-btn" onClick={() => onNavigate("dashboard")}>
              View dashboard
            </button>
          </div>
        </div>

        <div className="hero-side">
          <RiskCard risk="Moderate" score={6} highlight />
          <StressMeter value={62} label="Current stress signal" />
        </div>
      </section>

      <section className="stats-grid">
        {quickStats.map((stat) => (
          <article key={stat.label} className="stat-card">
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
          </article>
        ))}
      </section>

      <section className="feature-grid">
        <article className="info-card">
          <h3>Assessment flow</h3>
          <p>Track symptoms, triggers, and coping signals across a trauma-informed checklist.</p>
        </article>
        <article className="info-card">
          <h3>Safety monitoring</h3>
          <p>Surface urgent concerns early while preserving privacy and respectful language.</p>
        </article>
        <article className="info-card">
          <h3>Care coordination</h3>
          <p>Share notes and updates with clinicians, advocates, and support teams in one place.</p>
        </article>
      </section>
    </>
  );
}

