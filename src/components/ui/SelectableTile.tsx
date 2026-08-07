import type { ReactNode } from "react";
import { Check } from "lucide-react";
import "./SelectableTile.css";

interface SelectableTileProps {
  label: string;
  sublabel?: string;
  selected: boolean;
  onSelect: () => void;
  icon?: ReactNode;
}

export function SelectableTile({
  label,
  sublabel,
  selected,
  onSelect,
  icon,
}: SelectableTileProps) {
  return (
    <button
      type="button"
      className={`selectable-tile ${selected ? "selectable-tile--selected" : ""}`}
      onClick={onSelect}
      aria-pressed={selected}
    >
      {icon && <span className="selectable-tile__icon">{icon}</span>}
      <span className="selectable-tile__text">
        <span className="selectable-tile__label">{label}</span>
        {sublabel && <span className="selectable-tile__sublabel">{sublabel}</span>}
      </span>
      {selected && (
        <span className="selectable-tile__check">
          <Check size={14} strokeWidth={3} />
        </span>
      )}
    </button>
  );
}
