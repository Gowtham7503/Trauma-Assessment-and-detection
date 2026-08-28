import { motion } from "framer-motion";
import { HeartPulse, MessageSquare, LineChart, Sparkles } from "lucide-react";

export default function Navbar({ activeView, setActiveView, views }) {
  const getIcon = (id) => {
    switch (id) {
      case "home":
        return <Sparkles size={17} />;
      case "chat":
        return <MessageSquare size={17} />;
      case "feedback":
        return <LineChart size={17} />;
      default:
        return <HeartPulse size={17} />;
    }
  };

  return (
    <header className="topbar">
      <div className="brand-wrap">
        <div className="brand-mark">
          <HeartPulse size={24} />
        </div>
        <div>
          <p className="eyebrow">MENTAL WELLNESS</p>
          <h2>MindAssess</h2>
        </div>
      </div>

      <nav className="nav" aria-label="Main navigation">
        {views.map((item) => {
          const isActive = item.id === activeView;
          return (
            <button
              key={item.id}
              type="button"
              className={`nav-item ${isActive ? "active" : ""}`}
              onClick={() => setActiveView(item.id)}
            >
              {getIcon(item.id)}
              <span>{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeNavTab"
                  className="nav-active-pill"
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                />
              )}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
