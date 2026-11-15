import type { ReactNode } from "react";
import { useSvgId } from "../hooks/useSvgId";

interface RoundIconProps {
  readonly from: string;
  readonly to: string;
  readonly children: ReactNode;
}

/** 32px round product icon on a vertical gradient disc. */
function RoundIcon({ from, to, children }: RoundIconProps) {
  const gradientId = useSvgId("product-grad");
  return (
    <svg width="32" height="32" viewBox="0 0 32 32">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={from} />
          <stop offset="1" stopColor={to} />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="16" fill={`url(#${gradientId})`} />
      {children}
    </svg>
  );
}

export function FlightsIcon() {
  return (
    <RoundIcon from="#6fb3ff" to="#1f6fe6">
      <path d="M5 18.5l18-4.5c1.6-.4 3 .2 3.2 1 .2.9-.9 1.7-2.5 2.1L8 21z" fill="#fff" />
      <path d="M12 16.8l3-5.6 2.2-.5-1.4 5z" fill="#fff" />
      <path d="M4 22h24" stroke="#ff6a3d" strokeWidth="1.6" />
    </RoundIcon>
  );
}

export function HotelsIcon() {
  return (
    <RoundIcon from="#7fd6a0" to="#2e9e5b">
      <rect x="10" y="8" width="12" height="18" rx="1.5" fill="#eef3ff" />
      <g fill="#4a72c9">
        <rect x="12" y="11" width="2.4" height="2.4" />
        <rect x="17.6" y="11" width="2.4" height="2.4" />
        <rect x="12" y="15.5" width="2.4" height="2.4" />
        <rect x="17.6" y="15.5" width="2.4" height="2.4" />
        <rect x="14.6" y="21" width="2.8" height="5" />
      </g>
    </RoundIcon>
  );
}

export function BusesIcon() {
  return (
    <RoundIcon from="#ffe17a" to="#f4b400">
      <rect x="5" y="10" width="22" height="12" rx="3" fill="#3a6fd8" />
      <rect x="7" y="12" width="13" height="4.5" rx="1" fill="#cfe0ff" />
      <rect x="21.5" y="12" width="3.5" height="6" rx="1" fill="#cfe0ff" />
      <circle cx="10" cy="22.5" r="2" fill="#1a1a1a" />
      <circle cx="22" cy="22.5" r="2" fill="#1a1a1a" />
    </RoundIcon>
  );
}

export function HolidaysIcon() {
  return (
    <RoundIcon from="#c7b8ff" to="#7b61ff">
      <path d="M6 15a10 10 0 0120 0z" fill="#ff5a4e" />
      <path d="M12.5 15a3.5 6 0 017 0z" fill="#fff" />
      <path d="M16 15v10" stroke="#5a3d1e" strokeWidth="1.4" />
    </RoundIcon>
  );
}
