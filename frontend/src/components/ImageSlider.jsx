import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, HeartPulse, ShieldCheck, Sparkles, MessageCircleHeart } from "lucide-react";
import defaultHero from "../assets/trauma-support-hero.png";
import secondaryHero from "../assets/hero.png";

const slides = [
  {
    id: 1,
    title: "Compassionate Trauma Assessment",
    subtitle: "A gentle, supportive approach designed to listen before asking sensitive questions.",
    image: defaultHero,
    badge: "Trauma-Informed Care",
    icon: HeartPulse,
    accentColor: "from-teal-500 to-emerald-700",
    bgGradient: "linear-gradient(135deg, rgba(20, 184, 166, 0.85), rgba(15, 118, 110, 0.95))"
  },
  {
    id: 2,
    title: "AI-Powered Risk Detection",
    subtitle: "Real-time analysis to prioritize care urgency and offer personalized action plans.",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80",
    badge: "Smart Analytics",
    icon: ShieldCheck,
    accentColor: "from-indigo-500 to-purple-800",
    bgGradient: "linear-gradient(135deg, rgba(99, 102, 241, 0.85), rgba(67, 56, 202, 0.95))"
  },
  {
    id: 3,
    title: "Safe & Confidential Space",
    subtitle: "Private, non-judgmental environment to express your thoughts at your own pace.",
    image: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?auto=format&fit=crop&w=1200&q=80",
    badge: "Private & Secure",
    icon: MessageCircleHeart,
    accentColor: "from-purple-500 to-pink-700",
    bgGradient: "linear-gradient(135deg, rgba(168, 85, 247, 0.85), rgba(126, 34, 206, 0.95))"
  },
  {
    id: 4,
    title: "Holistic Wellness Insights",
    subtitle: "Comprehensive feedback and tailored coping strategies generated for your situation.",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80",
    badge: "Guided Recovery",
    icon: Sparkles,
    accentColor: "from-cyan-500 to-blue-700",
    bgGradient: "linear-gradient(135deg, rgba(6, 182, 212, 0.85), rgba(3, 105, 161, 0.95))"
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
    }, 5500);
    return () => clearInterval(interval);
  }, [isPaused, handleNext]);

  const slideVariants = {
    initial: (dir) => ({
      x: dir > 0 ? "100%" : "-100%",
      opacity: 0,
      scale: 0.95
    }),
    animate: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.4 },
        scale: { duration: 0.4 }
      }
    },
    exit: (dir) => ({
      x: dir > 0 ? "-100%" : "100%",
      opacity: 0,
      scale: 0.95,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.3 }
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
                // Fallback to secondary asset if unspash load issues occur
                e.target.src = secondaryHero;
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
              <IconComponent size={16} />
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

      {/* Control Buttons */}
      <button
        type="button"
        className="slider-nav-btn prev"
        onClick={handlePrev}
        aria-label="Previous slide"
      >
        <ChevronLeft size={22} />
      </button>

      <button
        type="button"
        className="slider-nav-btn next"
        onClick={handleNext}
        aria-label="Next slide"
      >
        <ChevronRight size={22} />
      </button>

      {/* Slide Indicators */}
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
