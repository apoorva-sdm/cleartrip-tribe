import { useSvgId } from "@/features/landing";

/* Mobile-only icons. Product icons share the round-gradient style of the desktop tabs. */

export function TrainsIcon() {
  const id = useSvgId("trains-grad");
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffb3a1" />
          <stop offset="1" stopColor="#f0644a" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="16" fill={`url(#${id})`} />
      <rect x="8" y="9" width="16" height="13" rx="3" fill="#eef3ff" />
      <rect x="10" y="11.5" width="12" height="4" rx="1" fill="#4a72c9" />
      <circle cx="11.5" cy="19" r="1.2" fill="#1a1a1a" />
      <circle cx="20.5" cy="19" r="1.2" fill="#1a1a1a" />
      <path d="M10 25l2-3M22 25l-2-3" stroke="#5a3d1e" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

const NAV = { fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round" } as const;

export function HomeNavIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden>
      <path d="M4 10.5L12 4l8 6.5V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1z" {...NAV} fill={active ? "currentColor" : "none"} />
    </svg>
  );
}

export function TripsNavIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden>
      <path d="M4 9h16v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" {...NAV} />
      <path d="M6 9V7l11-3 1 5" {...NAV} />
      <path d="M9 14h6" {...NAV} />
    </svg>
  );
}

export function TribeNavIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="8.5" r="3" {...NAV} />
      <path d="M6.5 19c.5-3 2.6-5 5.5-5s5 2 5.5 5" {...NAV} />
      <circle cx="5.5" cy="10.5" r="2.2" {...NAV} />
      <path d="M2.5 17.5c.3-2 1.5-3.3 3.2-3.6" {...NAV} />
      <circle cx="18.5" cy="10.5" r="2.2" {...NAV} />
      <path d="M21.5 17.5c-.3-2-1.5-3.3-3.2-3.6" {...NAV} />
    </svg>
  );
}

export function WorkNavIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden>
      <rect x="3.5" y="7" width="17" height="13" rx="2" {...NAV} />
      <path d="M9 7V5h6v2M3.5 12.5h17" {...NAV} />
    </svg>
  );
}

export function AccountNavIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="9" {...NAV} />
      <circle cx="12" cy="10" r="3" {...NAV} />
      <path d="M6.5 18.5c1.2-2 3.1-3 5.5-3s4.3 1 5.5 3" {...NAV} />
    </svg>
  );
}

export function OffersNavIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden>
      <path d="M12 3l2.2 1.6 2.7-.2.9 2.6 2.3 1.4-.8 2.6.8 2.6-2.3 1.4-.9 2.6-2.7-.2L12 21l-2.2-1.6-2.7.2-.9-2.6-2.3-1.4.8-2.6-.8-2.6 2.3-1.4.9-2.6 2.7.2z" {...NAV} />
      <path d="M9.5 14.5l5-5" {...NAV} />
      <circle cx="9.7" cy="9.7" r=".6" {...NAV} />
      <circle cx="14.3" cy="14.3" r=".6" {...NAV} />
    </svg>
  );
}

const CHIP = { fill: "none", stroke: "currentColor", strokeWidth: 1.3, strokeLinecap: "round", strokeLinejoin: "round" } as const;

export function SparklesChipIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden>
      <path d="M8 3.5c.5 3 2 4.5 5 5-3 .5-4.5 2-5 5-.5-3-2-4.5-5-5 3-.5 4.5-2 5-5z" {...CHIP} />
      <path d="M15 12.5c.2 1.2.8 1.8 2 2-1.2.2-1.8.8-2 2-.2-1.2-.8-1.8-2-2 1.2-.2 1.8-.8 2-2z" {...CHIP} />
    </svg>
  );
}

export function PlaneChipIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden>
      <path d="M3 11.5l3 1 2.5 4 1.2-.6-.7-3.6 3.8-1.6 3.4 2.6 1-.5-2.2-4.6L17 6.5c.5-.8 0-1.6-.9-1.3L11.4 7 7 3.8l-1.2.5 2.4 4.2-3 1.4-1.6-1.3-.8.3z" {...CHIP} />
    </svg>
  );
}

export function HotelChipIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden>
      <rect x="4" y="3" width="12" height="14" rx="1" {...CHIP} />
      <path d="M7 6.5h1.5M11.5 6.5H13M7 10h1.5M11.5 10H13M8.5 17v-3h3v3" {...CHIP} />
    </svg>
  );
}

export function BusChipIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden>
      <rect x="3.5" y="3" width="13" height="12" rx="2.5" {...CHIP} />
      <path d="M3.5 9h13M6.5 15v2M13.5 15v2" {...CHIP} />
      <circle cx="7" cy="12" r=".6" {...CHIP} />
      <circle cx="13" cy="12" r=".6" {...CHIP} />
    </svg>
  );
}
