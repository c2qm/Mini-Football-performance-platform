import type { ReactNode } from "react";
import "./Tag.css";

export type TagColor =
  | "neutral"
  | "green"
  | "yellow"
  | "blue"
  | "red"
  | "purple"
  | "orange"
  | "teal";

interface TagProps {
  children: ReactNode;
  color?: TagColor;
  icon?: ReactNode;
}

export function Tag({ children, color = "neutral", icon }: TagProps) {
  return (
    <span className={`tag tag--${color}`}>
      {icon && <span className="tag__icon">{icon}</span>}
      {children}
    </span>
  );
}
