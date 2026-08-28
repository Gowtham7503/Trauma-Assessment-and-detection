import { motion } from "framer-motion";
import { HeartPulse, User } from "lucide-react";

export default function Message({ children, role = "bot" }) {
  const isUser = role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`message-wrapper ${isUser ? "user" : "bot"}`}
    >
      <div className={`message-avatar ${isUser ? "user" : "bot"}`}>
        {isUser ? <User size={16} /> : <HeartPulse size={16} />}
      </div>
      <div className={`message ${isUser ? "message--user" : "message--bot"}`}>
        <div className="message-header-tag">
          {isUser ? "You" : "Trauma Care Assistant"}
        </div>
        <div className="message-content">{children}</div>
      </div>
    </motion.div>
  );
}
