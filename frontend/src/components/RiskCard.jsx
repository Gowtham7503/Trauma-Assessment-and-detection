export default function RiskCard({ risk = "Pending", score = 0, compact = false, highlight = false }) {
  const tone = String(risk).toLowerCase();

  return (
    <article className={highlight ? "risk-card highlight" : compact ? "risk-card compact" : "risk-card"}>
      <div className="risk-card__header">
        <span className="risk-label">Risk</span>
        <span className={`risk-badge ${tone}`}>{risk}</span>
      </div>
      <strong>{score}</strong>
      <small>risk points</small>
    </article>
  );
}

