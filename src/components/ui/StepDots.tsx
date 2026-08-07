import "./StepDots.css";

interface StepDotsProps {
  total: number;
  current: number; // 0-indexed
}

export function StepDots({ total, current }: StepDotsProps) {
  return (
    <div className="step-dots" role="progressbar" aria-valuenow={current + 1} aria-valuemax={total}>
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`step-dots__dot ${i === current ? "step-dots__dot--active" : ""} ${
            i < current ? "step-dots__dot--done" : ""
          }`}
        />
      ))}
    </div>
  );
}
