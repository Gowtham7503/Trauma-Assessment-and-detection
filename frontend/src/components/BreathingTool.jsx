import { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, Wind, HeartPulse } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const phases = [
  { name: "Inhale Slowly", duration: 4, action: "Expand your chest and breathe in deeply through your nose.", color: "#0d9488" },
  { name: "Hold Breath", duration: 4, action: "Keep your breath steady and retain air comfortably.", color: "#0284c7" },
  { name: "Exhale Gently", duration: 4, action: "Slowly release air through your mouth, relaxing your shoulders.", color: "#3730a3" },
  { name: "Rest & Pause", duration: 4, action: "Pause before your next breath. Notice the calmness in your body.", color: "#10b981" }
];

export default function BreathingTool() {
  const [isActive, setIsActive] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(phases[0].duration);
  const [completedCycles, setCompletedCycles] = useState(0);

  const currentPhase = phases[phaseIndex];

  const handleToggle = () => {
    setIsActive((active) => !active);
  };

  useEffect(() => {
    let timer = null;
    if (isActive) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Move to next phase
            setPhaseIndex((nextPhase) => {
              const updated = (nextPhase + 1) % phases.length;
              if (updated === 0) {
                setCompletedCycles((c) => c + 1);
              }
              return updated;
            });
            return phases[(phaseIndex + 1) % phases.length].duration;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [isActive, phaseIndex]);

  const handleReset = () => {
    setIsActive(false);
    setPhaseIndex(0);
    setTimeLeft(phases[0].duration);
    setCompletedCycles(0);
  };

  return (
    <div className="breathing-tool-card">
      <div className="breathing-header">
        <div className="badge-pill">
          <Wind size={16} />
          <span>Interactive Stress Relief Tool</span>
        </div>
        <h3 className="breathing-title">Guided 4-4-4-4 Box Breathing Routine</h3>
        <p className="breathing-subtitle">
          Clinically proven to activate the parasympathetic nervous system, lower cortisol, and instantly reduce stress.
        </p>
      </div>

      <div className="breathing-visualizer-container">
        <motion.button
          type="button"
          animate={{
            scale: isActive
              ? phaseIndex === 0
                ? 1.28
                : phaseIndex === 1
                ? 1.28
                : phaseIndex === 2
                ? 0.88
                : 1
              : 1,
            borderColor: currentPhase.color
          }}
          transition={{ duration: 3.8, ease: "easeInOut" }}
          className="breathing-circle"
          style={{ borderColor: currentPhase.color }}
          onClick={handleToggle}
          aria-pressed={isActive}
          aria-label={isActive ? "Pause breathing routine" : "Start breathing routine"}
        >
          <div className="breathing-inner-content">
            <span className="phase-timer">{timeLeft}s</span>
            <span className="phase-name">{isActive ? currentPhase.name : "Tap to Start"}</span>
          </div>
        </motion.button>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentPhase.name}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="phase-description"
          >
            <p>{isActive ? currentPhase.action : "Press Start to begin guided stress-relief breathing cycles."}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="breathing-controls">
        <button
          type="button"
          className={`slider-btn ${isActive ? "secondary" : "primary"}`}
          onClick={handleToggle}
        >
          {isActive ? <Pause size={18} /> : <Play size={18} />}
          <span>{isActive ? "Pause Routine" : "Start Guided Breathing"}</span>
        </button>

        <button
          type="button"
          className="chat-reset-btn"
          onClick={handleReset}
        >
          <RotateCcw size={16} />
          <span>Reset</span>
        </button>

        {completedCycles > 0 && (
          <span className="cycles-badge">
            <HeartPulse size={15} />
            <span>{completedCycles} Cycles Completed</span>
          </span>
        )}
      </div>
    </div>
  );
}
