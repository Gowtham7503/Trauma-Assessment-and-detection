import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import Chat from "./pages/Chat.jsx";
import Feedback from "./pages/Feedback.jsx";

const views = [
  { id: "home", label: "Overview", component: Home },
  { id: "chat", label: "Trauma Assessment", component: Chat },
  { id: "feedback", label: "Feedback", component: Feedback },
];

const pageTransitionVariants = {
  initial: { opacity: 0, y: 15, scale: 0.99 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: "easeOut" } },
  exit: { opacity: 0, y: -15, scale: 0.99, transition: { duration: 0.2, ease: "easeIn" } }
};

export default function App() {
  const [activeView, setActiveView] = useState("home");
  const [feedback, setFeedback] = useState(null);
  const activePage = views.find((view) => view.id === activeView) ?? views[0];
  const PageComponent = activePage.component;

  return (
    <div className="app-shell">
      <Navbar activeView={activeView} setActiveView={setActiveView} views={views} />
      <main className="page-shell">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            variants={pageTransitionVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <PageComponent
              feedback={feedback}
              onFeedback={setFeedback}
              onNavigate={setActiveView}
            />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
