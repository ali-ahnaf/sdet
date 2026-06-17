import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { radii } from "../theme";

type Decoration = "none" | "tape" | "tack";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Paper flourish pinned to the top of the card. */
  decoration?: Decoration;
  /** Adds the hover "jiggle" + lift treatment. */
  interactive?: boolean;
  /** Per-instance tilt, e.g. "-2deg". */
  tilt?: string;
  /** Border-radius preset; defaults to the medium wobble. */
  radius?: string;
  children: ReactNode;
}

/**
 * Cut-paper container. Decorations are positioned absolutely against the
 * card's own bounds, so the card establishes a relative context.
 */
export function Card({
  decoration = "none",
  interactive = false,
  tilt,
  radius = radii.wobblyMd,
  className,
  style,
  children,
  ...rest
}: CardProps) {
  const classes = ["hd-card", interactive && "hd-card--interactive", className]
    .filter(Boolean)
    .join(" ");

  // `--hd-tilt` feeds the transform in index.css (see .hd-card). Custom props
  // aren't in the CSSProperties type, hence the cast.
  const mergedStyle = {
    position: "relative",
    borderRadius: radius,
    ...(tilt ? { "--hd-tilt": tilt } : {}),
    ...style,
  } as CSSProperties;

  return (
    <div className={classes} style={mergedStyle} {...rest}>
      {decoration === "tape" && <Tape />}
      {decoration === "tack" && <Tack />}
      {children}
    </div>
  );
}

/** Translucent strip of tape across the top edge. */
function Tape() {
  return (
    <span
      aria-hidden="true"
      style={{
        position: "absolute",
        top: -12,
        left: "50%",
        width: 90,
        height: 26,
        transform: "translateX(-50%) rotate(-3deg)",
        background: "rgba(45, 45, 45, 0.12)",
        border: "1px dashed rgba(45, 45, 45, 0.25)",
        borderRadius: "2px",
      }}
    />
  );
}

/** Red circular thumbtack pinned at the top center. */
function Tack() {
  return (
    <span
      aria-hidden="true"
      style={{
        position: "absolute",
        top: -10,
        left: "50%",
        width: 18,
        height: 18,
        transform: "translateX(-50%)",
        background: "var(--hd-accent)",
        border: "2px solid var(--hd-fg)",
        borderRadius: "60% 40% 55% 45% / 50% 55% 45% 50%",
        boxShadow: "1px 1px 0 0 rgba(45,45,45,0.4)",
      }}
    />
  );
}
