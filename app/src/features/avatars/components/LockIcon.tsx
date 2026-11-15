interface LockIconProps {
  size?: number;
  open?: boolean;
}

export function LockIcon({ size = 12, open = false }: LockIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden>
      <rect x="2" y="5.5" width="8" height="5.5" rx="1.2" />
      <path d={open ? "M4 5.5V4a2 2 0 0 1 3.9-.6" : "M4 5.5V4a2 2 0 0 1 4 0v1.5"} strokeLinecap="round" />
    </svg>
  );
}
