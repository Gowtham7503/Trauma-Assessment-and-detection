export default function Navbar({ activeView, setActiveView, views }) {
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
        {views.map((item) => (
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
