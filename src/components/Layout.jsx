import { NavLink, Outlet } from "react-router-dom";

const navLinks = [
  { to: "/", label: "홈", end: true },
  { to: "/bookmarks", label: "북마크 목록" },
  { to: "/bookmarks/new", label: "새 북마크" },
];

export function Layout() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">📎 Bookmark Keeper</div>
        <nav>
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end}>
              {link.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
