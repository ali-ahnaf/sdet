/**
 * Hand-drawn icon set — small inline SVGs with thick, round strokes so they
 * read like marker doodles. Using `currentColor` lets each icon inherit the
 * text color of its button. (We hand-roll these instead of pulling in an icon
 * library to keep the client dependency-free and on-theme.)
 */
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Icon({ size = 22, children, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export const PlusIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M12 5.5c-.3 3 .2 8 0 13" />
    <path d="M5.5 12c4-.3 9 .2 13 0" />
  </Icon>
);

export const CheckIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M4.5 12.5c1.6 1.2 3 2.8 4 4.5 2.2-4.6 5.3-8.4 9.8-11.5" />
  </Icon>
);

export const PencilIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M16.5 3.8c1.2-.8 2.6.6 1.9 1.9L8.7 19 4.5 19.5 5 15.3 16.5 3.8Z" />
    <path d="M14.5 6 16.8 8.3" />
  </Icon>
);

export const TrashIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M4.5 6.5c5-.6 10-.6 15 0" />
    <path d="M9.5 6c-.2-1.4.3-2.4 2.5-2.4S14.7 4.6 14.5 6" />
    <path d="M6.5 7c.3 4.4.4 8.8 1 12 .2 1 .8 1.6 2 1.7 1.7.2 3.4.2 5 0 1.2-.1 1.8-.7 2-1.7.6-3.2.7-7.6 1-12" />
    <path d="M10 10.5c.2 2.5.2 4.8 0 7M14 10.5c-.2 2.2-.2 4.5 0 7" />
  </Icon>
);

export const XIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M6 6c3.6 3.4 7.4 7.2 12 12" />
    <path d="M18 6c-3.6 3.4-7.4 7.2-12 12" />
  </Icon>
);

export const EyeIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M2.5 12c3-5 6.4-7.4 9.5-7.4S18.5 7 21.5 12c-3 5-6.4 7.4-9.5 7.4S5.5 17 2.5 12Z" />
    <path d="M12 9.4c1.5-.1 2.7 1.1 2.6 2.6 0 1.4-1.2 2.6-2.6 2.5-1.4 0-2.6-1.1-2.5-2.5 0-1.4 1.1-2.5 2.5-2.6Z" />
  </Icon>
);

export const EyeOffIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M2.5 12c2-3.3 4.3-5.6 6.6-6.7" />
    <path d="M13.5 4.8c3 .7 5.6 3.1 8 7.2-2 3.4-4.4 5.7-6.8 6.8" />
    <path d="M10 14.1c-.9-.9-1-2.4-.1-3.4.5-.5 1.1-.8 1.8-.8" />
    <path d="M4.5 4.5c5 4.9 10 9.9 15 15" />
  </Icon>
);
