import { useState } from "react";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import Chat from "./pages/Chat.jsx";
import Feedback from "./pages/Feedback.jsx";

const views = [
  { id: "home", label: "Overview", component: Home },
  { id: "chat", label: "Trauma chat", component: Chat },
  { id: "feedback", label: "Feedback", component: Feedback },
];

export default function App() {
  const [activeView, setActiveView] = useState("home");
  const [feedback, setFeedback] = useState(null);
  const activePage = views.find((view) => view.id === activeView) ?? views[0];
  const PageComponent = activePage.component;

  return (
    <div className="app-shell">
      <Navbar activeView={activeView} setActiveView={setActiveView} views={views} />
      <main className="page-shell">
        <PageComponent
          feedback={feedback}
          onFeedback={setFeedback}
          onNavigate={setActiveView}
        />
      </main>
    </div>
  );
}
