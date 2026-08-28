import heroImage from "../assets/trauma-support-hero.png";

const quickStats = [
  { label: "Step 1", value: "Overview" },
  { label: "Step 2", value: "Chat" },
  { label: "Step 3", value: "Feedback" },
];

export default function Home({ onNavigate }) {
  return (
    <>
      <section className="hero-panel">
        <div className="hero-copy">
          <p className="eyebrow accent">Trauma-informed care</p>
          <h1>Trauma assessment support that starts gently.</h1>
          <p className="lead">
            Begin with a calm overview, continue through a guided chat, and review feedback
            shaped from the person&apos;s own inputs.
          </p>
          <div className="hero-actions">
            <button type="button" className="primary-btn" onClick={() => onNavigate("chat")}>
              Start chat
            </button>
            <button type="button" className="secondary-btn" onClick={() => onNavigate("feedback")}>
              View feedback
            </button>
          </div>
        </div>

        <figure className="hero-image-wrap">
          <img src={heroImage} alt="A calm trauma support conversation in a counseling room" />
        </figure>
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
          <h3>Gentle first contact</h3>
          <p>Set a safe tone before asking personal questions or collecting sensitive details.</p>
        </article>
        <article className="info-card">
          <h3>Guided conversation</h3>
          <p>Gather what happened, how the person feels now, and what kind of support they need.</p>
        </article>
        <article className="info-card">
          <h3>Clear feedback</h3>
          <p>Show risk priority, a short summary, and suggested next steps on the feedback page.</p>
        </article>
      </section>
    </>
  );
}
