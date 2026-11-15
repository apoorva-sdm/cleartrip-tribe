import type { TravelMode } from "@/domain";

/** Small illustration of the mode of transport. */
export function ModeArt({ mode, size = 48 }: { mode: TravelMode; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden style={{ flex: "none" }}>
      <circle cx="24" cy="24" r="24" fill="#ecf3ff" />
      {mode === "flight" && (
        <g fill="#3366cc">
          <path d="M8 26.5l2-1.2 9.5 1.6 7-9.4c.8-1 2.2-1.4 3.4-.8l.6.3-4.8 11.2 8.6 1.4 2.6-2.4 1.6.4-1.5 4.2-15.4-2.6-11.6-1.4z" />
          <path d="M18 31l3 .5-2.5 5.5-2 .2z" opacity="0.7" />
        </g>
      )}
      {mode === "train" && (
        <g>
          <rect x="14" y="10" width="20" height="24" rx="5" fill="#ff4f17" />
          <rect x="17" y="14" width="14" height="8" rx="2" fill="#fff" />
          <circle cx="19" cy="28" r="1.8" fill="#fff" />
          <circle cx="29" cy="28" r="1.8" fill="#fff" />
          <path d="M17 34l-3 5M31 34l3 5M15 38h18" stroke="#1a1a1a" strokeWidth="1.6" strokeLinecap="round" />
        </g>
      )}
      {mode === "bus" && (
        <g>
          <rect x="10" y="13" width="28" height="20" rx="4" fill="#11a670" />
          <rect x="13" y="16" width="22" height="8" rx="1.5" fill="#fff" />
          <path d="M24 16v8" stroke="#11a670" strokeWidth="1.5" />
          <circle cx="16" cy="34" r="3" fill="#1a1a1a" />
          <circle cx="32" cy="34" r="3" fill="#1a1a1a" />
          <rect x="13" y="27" width="4" height="2" rx="1" fill="#fff" />
          <rect x="31" y="27" width="4" height="2" rx="1" fill="#fff" />
        </g>
      )}
    </svg>
  );
}
