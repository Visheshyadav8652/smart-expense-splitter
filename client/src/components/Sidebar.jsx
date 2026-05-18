import { NavLink } from "react-router-dom";

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-card">
        <div className="sidebar-avatar">S</div>
        <div className="sidebar-title">Smart Splitter</div>
        <div className="sidebar-sub">Track shared expenses</div>
      </div>
      <nav className="sidebar-nav">
        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive ? "sidebar-link active" : "sidebar-link"
          }
        >
          Groups
        </NavLink>
      </nav>
      <div className="sidebar-footnote">
        Keep bills tidy and settle fast.
      </div>
    </aside>
  );
};

export default Sidebar;
