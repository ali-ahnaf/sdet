import type { CSSProperties, ReactNode } from "react";

interface TagProps {
  background: string;
  color: string;
  tilt?: string;
  children: ReactNode;
}

/** Sticky-note style label — small wobbly chip with a hard mini-shadow. */
export function Tag({ background, color, tilt = "-2deg", children }: TagProps) {
  const style: CSSProperties = {
    display: "inline-block",
    padding: "0.1rem 0.6rem",
    fontFamily: "var(--hd-font-body)",
    fontSize: "0.85rem",
    lineHeight: 1.4,
    color,
    background,
    border: "2px solid var(--hd-fg)",
    borderRadius: "120px 8px 120px 10px / 8px 120px 10px 120px",
    boxShadow: "2px 2px 0 0 rgba(45,45,45,0.25)",
    transform: `rotate(${tilt})`,
    whiteSpace: "nowrap",
  };
  return <span style={style}>{children}</span>;
}
