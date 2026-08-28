import { useMemo, useState } from "react";

const assessmentQuestions = [
  { id: "sleep", label: "Sleep disruption", weight: 2 },
  { id: "concentration", label: "Difficulty concentrating", weight: 2 },
  { id: "triggered", label: "Feeling easily triggered", weight: 3 },
  { id: "withdrawal", label: "Withdrawing from support", weight: 2 },
  { id: "panic", label: "Panic or intense fear episodes", weight: 3 },
];

const optionMap = {
  0: "Not at all",
  1: "Occasionally",
  2: "Sometimes",
  3: "Often",
};

function getRiskLevel(score) {
  if (score >= 8) return { level: "High", tone: "high" };
  if (score >= 4) return { level: "Moderate", tone: "moderate" };
  return { level: "Low", tone: "low" };
}

export default function Assessment() {
  const [responses, setResponses] = useState({
    sleep: 1,
    concentration: 1,
    triggered: 2,
    withdrawal: 1,
    panic: 0,
  });

  const totalScore = useMemo(
    () => assessmentQuestions.reduce((sum, question) => sum + (responses[question.id] ?? 0), 0),
    [responses],
  );

  const risk = useMemo(() => getRiskLevel(totalScore), [totalScore]);

  const updateResponse = (questionId, value) => {
    setResponses((current) => ({ ...current, [questionId]: Number(value) }));
  };

  return (
    <section className="assessment-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow accent">Structured intake</p>
          <h1>Trauma assessment checklist</h1>
        </div>
        <div className={`risk-pill ${risk.tone}`}>{risk.level} risk</div>
      </div>

      <div className="assessment-grid">
        <div className="question-list">
          {assessmentQuestions.map((question) => (
            <article key={question.id} className="question-card">
              <div className="question-header">
                <h3>{question.label}</h3>
                <span>{question.weight} pts</span>
              </div>

              <div className="score-row" role="radiogroup" aria-label={question.label}>
                {[0, 1, 2, 3].map((value) => (
                  <label key={value} className="score-option">
                    <input
                      type="radio"
                      name={question.id}
                      value={value}
                      checked={responses[question.id] === value}
                      onChange={() => updateResponse(question.id, value)}
                    />
                    <span>{optionMap[value]}</span>
                  </label>
                ))}
              </div>
            </article>
          ))}
        </div>

        <aside className="summary-card">
          <p className="eyebrow">Current summary</p>
          <h2>{totalScore} / 22 points</h2>
          <div className="summary-bar">
            <div className={`summary-fill ${risk.tone}`} style={{ width: `${Math.min((totalScore / 22) * 100, 100)}%` }} />
          </div>
          <p>
            {risk.level === "High" && "Escalate for safety review and confirm next steps with the support team."}
            {risk.level === "Moderate" && "Continue monitoring and schedule follow-up support within the next 48 hours."}
            {risk.level === "Low" && "Current indicators are stable; continue routine check-ins and observation."}
          </p>
          <button type="button" className="primary-btn wide">
            Submit assessment
          </button>
        </aside>
      </div>
    </section>
  );
}

