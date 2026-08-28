import { useState } from "react";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import Assessment from "./pages/Assessment.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Chat from "./pages/Chat.jsx";
import CaseDetails from "./pages/CaseDetails.jsx";

const views = [
  { id: "home", label: "Overview", component: Home },
  { id: "assessment", label: "Assessment", component: Assessment },
  { id: "dashboard", label: "Dashboard", component: Dashboard },
  { id: "chat", label: "Coordinator chat", component: Chat },
  { id: "case", label: "Case detail", component: CaseDetails },
];

export default function App() {
  const [activeView, setActiveView] = useState("home");
  const activePage = views.find((view) => view.id === activeView) ?? views[0];
  const PageComponent = activePage.component;

  return (
    <div className="app-shell">
      <Navbar activeView={activeView} setActiveView={setActiveView} />
      <main className="page-shell">
        <PageComponent onNavigate={setActiveView} />
      </main>
    </div>
  );
}

