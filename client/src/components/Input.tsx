import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

/**
 * Full-box wobbly input with a blue ballpoint focus ring (styled in
 * `index.css`). Forwards its ref so callers can focus it, e.g. when entering
 * inline edit mode.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, ...rest },
  ref,
) {
  const classes = ["hd-input", className].filter(Boolean).join(" ");
  return <input ref={ref} className={classes} {...rest} />;
});
