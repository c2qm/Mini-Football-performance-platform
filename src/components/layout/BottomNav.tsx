import { NavLink } from "react-router-dom";
import { Clock, CalendarDays, BarChart3, Settings as SettingsIcon } from "lucide-react";
import "./BottomNav.css";

const TABS = [
  { to: "/today", label: "Today", icon: Clock },
  { to: "/plan", label: "Plan", icon: CalendarDays },
  { to: "/progress", label: "Progress", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];

export function BottomNav() {
  return (
    <nav className="bottom-nav">
      {TABS.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) => `bottom-nav__item ${isActive ? "bottom-nav__item--active" : ""}`}
        >
          <Icon size={22} strokeWidth={1.8} />
          <span className="bottom-nav__label">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
