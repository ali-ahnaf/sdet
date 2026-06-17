/**
 * Typed accessors for the Hand-Drawn design tokens.
 *
 * The canonical values live as CSS custom properties in `index.css` (see
 * `:root`). These constants reference them via `var(--hd-*)` so inline styles
 * stay in sync with the stylesheet — change a token in one place only.
 */

export const colors = {
  bg: "var(--hd-bg)",
  fg: "var(--hd-fg)",
  muted: "var(--hd-muted)",
  accent: "var(--hd-accent)",
  accent2: "var(--hd-accent-2)",
  card: "var(--hd-card)",
  postit: "var(--hd-postit)",
} as const;

export const fonts = {
  heading: "var(--hd-font-heading)",
  body: "var(--hd-font-body)",
} as const;

/** Irregular border-radius presets — reject geometric perfection. */
export const radii = {
  wobbly: "var(--hd-wobbly)",
  wobblyMd: "var(--hd-wobbly-md)",
  wobblyAlt: "var(--hd-wobbly-alt)",
} as const;

export const shadows = {
  soft: "var(--hd-shadow-soft)",
  base: "var(--hd-shadow)",
  lg: "var(--hd-shadow-lg)",
} as const;

/** Small tilt values used to break rigid grid alignment. */
export const rotations = ["-2deg", "1deg", "-1deg", "2deg", "-1.5deg"] as const;

/** Deterministic tilt so a given list index always leans the same way. */
export const tiltFor = (index: number): string =>
  rotations[index % rotations.length];

import type { TodoPriority } from "@sdet/shared";

/** Visual treatment per priority — sticky-note swatch + label. */
export const priorityStyle: Record<
  TodoPriority,
  { label: string; background: string; color: string }
> = {
  high: { label: "urgent", background: colors.accent, color: "#fff" },
  medium: { label: "soon", background: colors.postit, color: colors.fg },
  low: { label: "whenever", background: colors.muted, color: colors.fg },
};
