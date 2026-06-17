import type { CSSProperties } from "react";
import { CheckIcon } from "./icons";

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Accessible label, e.g. the todo title. */
  label: string;
}

/**
 * Hand-drawn checkbox: a wobbly square that fills with accent red and shows a
 * marker check when ticked. Rendered as a real button with `role="checkbox"`
 * so keyboard + screen-reader users get native toggle semantics.
 */
export function Checkbox({ checked, onChange, label }: CheckboxProps) {
  const style: CSSProperties = {
    flexShrink: 0,
    width: 30,
    height: 30,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
    cursor: "pointer",
    color: "#fff",
    background: checked ? "var(--hd-accent)" : "var(--hd-card)",
    border: "2.5px solid var(--hd-fg)",
    borderRadius: "60% 40% 55% 45% / 50% 60% 40% 50%",
    boxShadow: "2px 2px 0 0 var(--hd-fg)",
    transition: "background-color 100ms ease, transform 100ms ease",
    transform: checked ? "rotate(-4deg)" : "rotate(2deg)",
  };

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={checked ? `Mark "${label}" as not done` : `Mark "${label}" as done`}
      onClick={() => onChange(!checked)}
      style={style}
    >
      {checked && <CheckIcon size={20} />}
    </button>
  );
}
