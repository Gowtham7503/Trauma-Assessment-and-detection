import ChatBox from "../components/ChatBox.jsx";

export default function Chat() {
  return (
    <section className="chat-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow accent">Support coordination</p>
          <h1>Care team chat</h1>
        </div>
      </div>
      <ChatBox />
    </section>
  );
}

