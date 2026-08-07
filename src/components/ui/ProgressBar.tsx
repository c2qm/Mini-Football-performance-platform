import "./ProgressBar.css";

interface ProgressBarProps {
  value: number; // 0 - 100
  height?: number;
  color?: string;
  trackColor?: string;
  animated?: boolean;
}

export function ProgressBar({
  value,
  height = 8,
  color = "var(--color-accent)",
  trackColor = "var(--color-accent-soft)",
  animated = true,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div
      className="progress-bar"
      style={{ height, background: trackColor }}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={`progress-bar__fill ${animated ? "progress-bar__fill--animated" : ""}`}
        style={{ width: `${clamped}%`, background: color }}
      />
    </div>
  );
}
