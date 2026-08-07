import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import "./ListRow.css";

interface ListRowProps {
  icon?: ReactNode;
  label: string;
  value?: string;
  onClick?: () => void;
  destructive?: boolean;
  showChevron?: boolean;
}

export function ListRow({
  icon,
  label,
  value,
  onClick,
  destructive = false,
  showChevron = true,
}: ListRowProps) {
  return (
    <button
      type="button"
      className={`list-row ${destructive ? "list-row--destructive" : ""}`}
      onClick={onClick}
    >
      {icon && <span className="list-row__icon">{icon}</span>}
      <span className="list-row__label">{label}</span>
      {value && <span className="list-row__value">{value}</span>}
      {showChevron && (
        <span className="list-row__chevron">
          <ChevronRight size={18} />
        </span>
      )}
    </button>
  );
}
