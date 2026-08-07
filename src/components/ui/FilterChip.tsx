import type { ReactNode } from "react";
import "./FilterChip.css";

interface FilterChipProps {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
}

export function FilterChip({ children, active = false, onClick }: FilterChipProps) {
  return (
    <button
      type="button"
      className={`filter-chip ${active ? "filter-chip--active" : ""}`}
      onClick={onClick}
      aria-pressed={active}
    >
      {children}
    </button>
  );
}
