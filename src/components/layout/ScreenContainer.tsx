import type { HTMLAttributes, ReactNode } from "react";
import "./ScreenContainer.css";

interface ScreenContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  withBottomNavSpacing?: boolean;
  noPadding?: boolean;
}

export function ScreenContainer({
  children,
  withBottomNavSpacing = false,
  noPadding = false,
  className = "",
  style = {},
  ...rest
}: ScreenContainerProps) {
  return (
    <div
      className={`screen ${withBottomNavSpacing ? "screen--nav-spacing" : ""} ${
        noPadding ? "screen--no-padding" : ""
      } ${className}`}
      style={style}
      {...rest}
    >
      {children}
    </div>
  );
}