export default function Navbar({ activeView, setActiveView }) {
  const navigation = [
    { id: "home", label: "Overview" },
    { id: "assessment", label: "Assessment" },
    { id: "dashboard", label: "Dashboard" },
    { id: "chat", label: "Chat" },
    { id: "case", label: "Case" },
  ];

  return (
    <header className="topbar">
      <div className="brand-wrap">
        <div className="brand-mark">N</div>
        <div>
          <p className="eyebrow">NHAA</p>
          <h2>Trauma Assessment</h2>
        </div>
      </div>

      <nav className="nav" aria-label="Main navigation">
        {navigation.map((item) => (
          <button
            key={item.id}
            type="button"
            className={item.id === activeView ? "nav-item active" : "nav-item"}
            onClick={() => setActiveView(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </header>
  );
}

