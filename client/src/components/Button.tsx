import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";

type Variant = "primary" | "secondary";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  /** Render as a square icon-only button (caller supplies an aria-label). */
  iconOnly?: boolean;
  children: ReactNode;
}

/**
 * Wobbly-oval button with a hard offset shadow that presses flat on click.
 * Interaction states (hover / active / focus) live in `index.css`.
 */
export function Button({
  variant = "primary",
  iconOnly = false,
  className,
  style,
  type = "button",
  children,
  ...rest
}: ButtonProps) {
  const classes = [
    "hd-btn",
    variant === "secondary" && "hd-btn--secondary",
    iconOnly && "hd-btn--icon",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type={type} className={classes} style={style as CSSProperties} {...rest}>
      {children}
    </button>
  );
}
