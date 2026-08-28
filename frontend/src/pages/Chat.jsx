import ChatBox from "../components/ChatBox.jsx";
import { ShieldCheck } from "lucide-react";

export default function Chat({ onFeedback, onNavigate }) {
  return (
    <section className="chat-panel">
      <div className="section-heading">
        <div>
          <div className="badge-pill">
            <ShieldCheck size={16} />
            <span>Confidential Assessment</span>
          </div>
          <h1 style={{ marginTop: "0.5rem" }}>Trauma Assessment</h1>
          <p className="lead">
            Answer three short prompts to analyze emotional impact, risk priority level, and tailored coping guidance.
          </p>
        </div>
      </div>
      <ChatBox onFeedback={onFeedback} onNavigate={onNavigate} />
    </section>
  );
}
