import { motion } from "framer-motion";
import { ShieldCheck, MessageCircle, BarChart3, Heart, Zap, UserCheck } from "lucide-react";
import ImageSlider from "../components/ImageSlider";

const stats = [
  { label: "Step 1", value: "Gentle Overview", sub: "Safe environment", icon: Heart },
  { label: "Step 2", value: "Guided Chat", sub: "Interactive screening", icon: MessageCircle },
  { label: "Step 3", value: "Instant Feedback", sub: "Actionable priority", icon: BarChart3 },
];

const features = [
  {
    icon: ShieldCheck,
    title: "Gentle First Contact",
    desc: "Provides a reassuring space that establishes emotional safety before inquiring about personal or sensitive details."
  },
  {
    icon: UserCheck,
    title: "Guided Conversation",
    desc: "Uses structured, empathetic inquiry to gather what happened, current feelings, and immediate support requirements."
  },
  {
    icon: Zap,
    title: "Instant Risk Priority",
    desc: "Generates clear severity assessments, concise summaries, and immediate next steps for healthcare responders."
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const itemVariants = {
  hidden: { y: 25, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 }
  }
};

export default function Home({ onNavigate }) {
  return (
    <div className="home-container">
      {/* Hero Section with Dynamic Sliding Carousel */}
      <section className="hero-section">
        <ImageSlider onActionClick={onNavigate} />
      </section>

      {/* Quick Steps / Stats Section */}
      <motion.section
        className="stats-grid"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
      >
        {stats.map((stat) => {
          const IconComp = stat.icon;
          return (
            <motion.article key={stat.label} className="stat-card" variants={itemVariants}>
              <div className="stat-icon-wrap">
                <IconComp size={24} />
              </div>
              <div className="stat-info">
                <span>{stat.label}</span>
                <strong>{stat.value}</strong>
              </div>
            </motion.article>
          );
        })}
      </motion.section>

      {/* Feature Highlights Grid */}
      <motion.section
        className="feature-grid"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
      >
        {features.map((feat) => {
          const IconComp = feat.icon;
          return (
            <motion.article key={feat.title} className="info-card" variants={itemVariants}>
              <div className="info-card-header">
                <div className="info-card-icon">
                  <IconComp size={22} />
                </div>
                <h3>{feat.title}</h3>
              </div>
              <p>{feat.desc}</p>
            </motion.article>
          );
        })}
      </motion.section>
    </div>
  );
}
