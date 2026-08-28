export default function Message({ children, role = "bot" }) {
  return <div className={role === "user" ? "message message--user" : "message message--bot"}>{children}</div>;
}

