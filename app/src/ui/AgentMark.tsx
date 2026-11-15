import { useId } from "react";

interface AgentMarkProps {
  size?: number;
  label?: string;
  /** A flat fill instead of the gradient (white on the reveal card backs). */
  color?: string;
}

/** The 4-point star in the Tribe gradient: marks anything the agent produced. */
export function AgentMark({ size = 12, label = "Done by the Tribe agent", color }: AgentMarkProps) {
  const gradientId = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" role="img" aria-label={label}>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e0309f" />
          <stop offset="1" stopColor="#ff5a36" />
        </linearGradient>
      </defs>
      <path d="M12 0C13 7 17 11 24 12C17 13 13 17 12 24C11 17 7 13 0 12C7 11 11 7 12 0Z" fill={color ?? `url(#${gradientId})`} />
    </svg>
  );
}
