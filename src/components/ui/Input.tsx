import { forwardRef, useState } from "react";
import type { InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";
import "./Input.css";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, helperText, error, type = "text", id, className = "", ...rest }, ref) => {
    const [visible, setVisible] = useState(false);
    const isPassword = type === "password";
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className={`input-field ${className}`}>
        {label && (
          <label className="input-field__label" htmlFor={inputId}>
            {label}
          </label>
        )}
        <div className={`input-field__wrap ${error ? "input-field__wrap--error" : ""}`}>
          <input
            ref={ref}
            id={inputId}
            type={isPassword && visible ? "text" : type}
            className="input-field__input"
            {...rest}
          />
          {isPassword && (
            <button
              type="button"
              className="input-field__toggle"
              onClick={() => setVisible((v) => !v)}
              aria-label={visible ? "Hide password" : "Show password"}
              tabIndex={-1}
            >
              {visible ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>
        {error ? (
          <span className="input-field__error">{error}</span>
        ) : helperText ? (
          <span className="input-field__helper">{helperText}</span>
        ) : null}
      </div>
    );
  },
);

Input.displayName = "Input";
