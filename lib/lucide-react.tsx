import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

function BaseIcon({ children, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export function AlarmClock(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l2 2" />
      <path d="M5 3 2 6" />
      <path d="m22 6-3-3" />
      <path d="M6 19 4 21" />
      <path d="M18 19l2 2" />
    </BaseIcon>
  );
}

export function BedSingle(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M3 6v12" />
      <path d="M3 13h18" />
      <path d="M7 13V9h6a4 4 0 0 1 4 4" />
      <path d="M3 18h18" />
    </BaseIcon>
  );
}

export function MoonStar(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M12 3a7 7 0 1 0 9 9 8 8 0 1 1-9-9Z" />
      <path d="M19 3v4" />
      <path d="M21 5h-4" />
    </BaseIcon>
  );
}

export function CigaretteOff(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M3 12h11" />
      <path d="M17 12h4v3h-4z" />
      <path d="M17 15H3" />
      <path d="M20 8c0-1.5-.5-2-1.5-2S17 6.5 17 8" />
      <path d="m4 4 16 16" />
    </BaseIcon>
  );
}

export function TimerReset(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M10 2h4" />
      <path d="M12 14v-4" />
      <path d="M12 14l3 3" />
      <path d="M12 22a8 8 0 1 0-8-8" />
      <path d="M4 8H1v3" />
    </BaseIcon>
  );
}
