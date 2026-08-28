import ChatBox from "../components/ChatBox.jsx";

export default function Chat({ onFeedback, onNavigate }) {
  return (
    <section className="chat-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow accent">Guided chat</p>
          <h1>Share what you are comfortable sharing</h1>
          <p className="lead">
            The chat follows each response with focused trauma-screening questions and prepares
            feedback when you finish.
          </p>
        </div>
      </div>
      <ChatBox onFeedback={onFeedback} onNavigate={onNavigate} />
    </section>
  );
}
