/**
 * Scribbled accents. Each is decorative-only (aria-hidden) and uses
 * `currentColor` or a token so callers can tint/position them freely.
 */
import type { CSSProperties } from "react";

interface DecorationProps {
  className?: string;
  style?: CSSProperties;
}

/** Hand-drawn wavy underline, e.g. beneath a heading. */
export function Squiggle({
  width = 220,
  color = "var(--hd-accent)",
  className,
  style,
}: DecorationProps & { width?: number; color?: string }) {
  return (
    <svg
      width={width}
      height={14}
      viewBox="0 0 220 14"
      fill="none"
      aria-hidden="true"
      className={className}
      style={style}
    >
      <path
        d="M2 8c14-7 28 5 42 4S72 4 86 5s28 7 42 6 28-8 42-7 26 6 46 3"
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Dashed hand-drawn arrow that curves toward a call-to-action. */
export function Arrow({
  color = "var(--hd-accent-2)",
  className,
  style,
}: DecorationProps & { color?: string }) {
  return (
    <svg
      width={70}
      height={70}
      viewBox="0 0 70 70"
      fill="none"
      aria-hidden="true"
      className={className}
      style={style}
    >
      <path
        d="M8 10c18 4 34 16 44 38"
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
        strokeDasharray="2 7"
      />
      <path
        d="M52 48c0-5 0-9 0-13M52 48c-4-1-8-1-12-2"
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Gently bouncing organic blob — decorative, often desktop-only. */
export function Blob({
  size = 60,
  color = "var(--hd-postit)",
  className,
  style,
}: DecorationProps & { size?: number; color?: string }) {
  const classes = ["hd-bounce", className].filter(Boolean).join(" ");
  return (
    <span
      aria-hidden="true"
      className={classes}
      style={{
        display: "inline-block",
        width: size,
        height: size,
        background: color,
        border: "3px solid var(--hd-fg)",
        borderRadius: "60% 40% 55% 45% / 45% 55% 45% 55%",
        boxShadow: "4px 4px 0 0 var(--hd-fg)",
        ...style,
      }}
    />
  );
}
