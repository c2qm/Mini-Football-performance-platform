import { Check } from "lucide-react";
import "./Checkbox.css";

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function Checkbox({ checked, onChange, label, disabled = false }: CheckboxProps) {
  return (
    <button
      type="button"
      className="checkbox"
      onClick={() => !disabled && onChange(!checked)}
      aria-pressed={checked}
      disabled={disabled}
    >
      <span className={`checkbox__box ${checked ? "checkbox__box--checked" : ""}`}>
        {checked && <Check size={12} strokeWidth={3} />}
      </span>
      {label && <span className="checkbox__label">{label}</span>}
    </button>
  );
}
