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
          <h1 style={{ marginTop: "0.5rem" }}>Stress & Trauma Assessment</h1>
          <p className="lead">
            The chat routes you into focused stress or trauma screening questions and prepares
            feedback when you finish.
          </p>
        </div>
      </div>
      <ChatBox onFeedback={onFeedback} onNavigate={onNavigate} />
    </section>
  );
}
