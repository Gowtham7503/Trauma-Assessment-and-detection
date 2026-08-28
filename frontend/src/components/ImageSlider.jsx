import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, HeartPulse, ShieldCheck, Activity, Stethoscope } from "lucide-react";
import defaultHero from "../assets/trauma-support-hero.png";
import secondaryHero from "../assets/hero.png";

const slides = [
  {
    id: 1,
    title: "Trauma-Informed Psychological Assessment",
    subtitle: "A compassionate, structured clinical triage approach designed to listen gently and establish emotional safety.",
    image: "https://images.unsplash.com/photo-1527137342181-19aab11a8ee8?auto=format&fit=crop&w=1400&q=80",
    fallbackImage: defaultHero,
    badge: "Clinical Triage & Support",
    icon: HeartPulse,
    accentColor: "from-teal-500 to-emerald-700",
  },
  {
    id: 2,
    title: "Real-Time Neural & Stress Detection",
    subtitle: "Advanced screening analytics that evaluate emotional strain, PTSD indicators, and care priority.",
    image: "https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=1400&q=80",
    fallbackImage: secondaryHero,
    badge: "AI Risk Screening",
    icon: Activity,
    accentColor: "from-cyan-500 to-blue-800",
  },
  {
    id: 3,
    title: "Empathetic Reassurance & Recovery",
    subtitle: "Providing a secure, non-judgmental environment to process traumatic events at your own pace.",
    image: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1400&q=80",
    fallbackImage: defaultHero,
    badge: "Safe Healing Sanctuary",
    icon: ShieldCheck,
    accentColor: "from-indigo-500 to-purple-800",
  },
  {
    id: 4,
    title: "Personalized Trauma Guidance",
    subtitle: "Immediate risk summary, grounding routines, and actionable follow-up plans for healthcare responders.",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1400&q=80",
    fallbackImage: secondaryHero,
    badge: "Clinical Action Plans",
    icon: Stethoscope,
    accentColor: "from-blue-600 to-teal-700",
  }
];

export default function ImageSlider({ onActionClick }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState(1);

  const handleNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
  }, []);

  const handlePrev = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prevIndex) => (prevIndex - 1 + slides.length) % slides.length);
  }, []);

  const handleDotClick = (index) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      handleNext();
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused, handleNext]);

  const slideVariants = {
    initial: (dir) => ({
      x: dir > 0 ? "100%" : "-100%",
      opacity: 0,
      scale: 0.96
    }),
    animate: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: "spring", stiffness: 280, damping: 28 },
        opacity: { duration: 0.45 },
        scale: { duration: 0.45 }
      }
    },
    exit: (dir) => ({
      x: dir > 0 ? "-100%" : "100%",
      opacity: 0,
      scale: 0.96,
      transition: {
        x: { type: "spring", stiffness: 280, damping: 28 },
        opacity: { duration: 0.35 }
      }
    })
  };

  const currentSlide = slides[currentIndex];
  const IconComponent = currentSlide.icon;

  return (
    <div
      className="slider-wrapper"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={currentSlide.id}
          custom={direction}
          variants={slideVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="slider-slide"
        >
          <div className="slider-image-container">
            <img
              src={currentSlide.image}
              alt={currentSlide.title}
              className="slider-image"
              onError={(e) => {
                // Fallback to local hero asset if network images hit restrictions
                e.target.src = currentSlide.fallbackImage;
              }}
            />
            <div className="slider-overlay" />
          </div>

          <div className="slider-caption-card">
            <motion.div
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.35 }}
              className="slider-badge"
            >
              <IconComponent size={17} />
              <span>{currentSlide.badge}</span>
            </motion.div>

            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.25, duration: 0.4 }}
              className="slider-title"
            >
              {currentSlide.title}
            </motion.h2>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.4 }}
              className="slider-subtitle"
            >
              {currentSlide.subtitle}
            </motion.p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.45, duration: 0.4 }}
              className="slider-actions"
            >
              <button
                type="button"
                className="slider-btn primary"
                onClick={() => onActionClick?.("chat")}
              >
                Start Assessment Chat
              </button>
              <button
                type="button"
                className="slider-btn secondary"
                onClick={() => onActionClick?.("feedback")}
              >
                View Feedback
              </button>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Controls */}
      <button
        type="button"
        className="slider-nav-btn prev"
        onClick={handlePrev}
        aria-label="Previous slide"
      >
        <ChevronLeft size={24} />
      </button>

      <button
        type="button"
        className="slider-nav-btn next"
        onClick={handleNext}
        aria-label="Next slide"
      >
        <ChevronRight size={24} />
      </button>

      {/* Pagination Indicators */}
      <div className="slider-indicators">
        {slides.map((slide, idx) => (
          <button
            key={slide.id}
            type="button"
            className={`slider-dot ${idx === currentIndex ? "active" : ""}`}
            onClick={() => handleDotClick(idx)}
            aria-label={`Go to slide ${idx + 1}`}
          >
            {idx === currentIndex && (
              <motion.div
                layoutId="activeDot"
                className="slider-dot-active-glow"
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
