import { NavLink } from "react-router-dom";

const Header = () => {
  return (
    <header className="topbar">
      <div>
        <div className="brand">Smart Expense Splitter</div>
        <div className="helper">Stay on top of every shared rupee.</div>
      </div>
      <nav className="nav">
        <NavLink
          to="/"
          className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
        >
          Groups
        </NavLink>
      </nav>
    </header>
  );
};

export default Header;
