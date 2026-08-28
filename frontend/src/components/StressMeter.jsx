export default function StressMeter({ value = 0, label = "Stress signal" }) {
  return (
    <div className="stress-meter">
      <div className="stress-meter__header">
        <span>{label}</span>
        <strong>{value}%</strong>
      </div>
      <div className="meter-track" aria-label={`${label}: ${value}%`}>
        <div className="meter-fill" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

