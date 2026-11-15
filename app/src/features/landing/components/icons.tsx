const INK = "#1a1a1a";

export function LogoMark() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24">
      <rect x="1" y="1" width="22" height="22" rx="5" fill="#ff4f17" />
      <path d="M6.5 12.5l3.5 3.5 7.5-8" stroke="#fff" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function OffersIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke={INK} strokeWidth="1.4">
      <circle cx="10" cy="10" r="7.5" strokeDasharray="2.2 1.4" />
      <path d="M7.5 12.5l5-5" />
      <circle cx="7.6" cy="7.6" r=".9" />
      <circle cx="12.4" cy="12.4" r=".9" />
    </svg>
  );
}

export function BusinessIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke={INK} strokeWidth="1.4">
      <rect x="3" y="6" width="14" height="10" rx="2" />
      <path d="M7.5 6V4.5h5V6M3 10.5h14" />
    </svg>
  );
}

export function SmallChevronDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={INK} strokeWidth="1.4">
      <path d="M3.5 5.5L7 9l3.5-3.5" />
    </svg>
  );
}

export function MyTripsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke={INK} strokeWidth="1.4">
      <path d="M3 9h14v7.5H3zM5 9V6.5l5-3 5 3V9M8 12.5h4" />
    </svg>
  );
}

export function MyTribeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke={INK} strokeWidth="1.4" strokeLinecap="round">
      <circle cx="10" cy="7" r="2.6" />
      <path d="M5.5 16c.4-2.6 2.2-4.2 4.5-4.2s4.1 1.6 4.5 4.2" />
      <circle cx="4.6" cy="8.6" r="1.9" />
      <path d="M1.8 15c.3-1.9 1.4-3 2.9-3.2" />
      <circle cx="15.4" cy="8.6" r="1.9" />
      <path d="M18.2 15c-.3-1.9-1.4-3-2.9-3.2" />
    </svg>
  );
}

export function SupportIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke={INK} strokeWidth="1.4">
      <path d="M4 11V9.5a6 6 0 0112 0V11" />
      <rect x="3" y="10.5" width="3" height="4.5" rx="1" />
      <rect x="14" y="10.5" width="3" height="4.5" rx="1" />
      <path d="M15.5 15c0 1.5-1.5 2-3.5 2" />
    </svg>
  );
}

export function TravellerIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={INK} strokeWidth="1.4">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 19.5c.6-3.5 3.4-5.5 7-5.5s6.4 2 7 5.5z" />
    </svg>
  );
}

export function ChevronDown() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={INK} strokeWidth="1.4">
      <path d="M8 10l4 4 4-4" />
    </svg>
  );
}

export function TrackPlaneIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12">
      <path d="M1 6.6l9.6-2.6c.8-.2 1.3.1 1.4.5.1.4-.4.8-1.2 1L2 8z" fill={INK} />
      <path d="M4.2 5.8l1.6-3.5 1.4-.3-.8 3.2zM5 7.3l.8 3.2 1.4-.3-1-3.6z" fill={INK} />
    </svg>
  );
}

export function TakeOffIcon() {
  return (
    <svg width="20" height="17" viewBox="0 0 20 17" fill="none" stroke={INK} strokeWidth="1.3">
      <path d="M1 16h18M2 11.5l14-3.6c1.3-.3 2.4.2 2.5.9.2.7-.7 1.3-2 1.6L4 13.5 1.6 9.6l1.3-.3 2.4 2" />
      <path d="M7.5 9.6L10 4.5l1.6-.4-.9 4.6" />
    </svg>
  );
}

export function LandingIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={INK} strokeWidth="1.3">
      <path d="M3 20h18M4 9.5l13.6 4c1.3.4 1.9 1.3 1.7 2-.2.7-1.3.9-2.6.5L3.5 12V7l1.4.4 1 2.9" />
      <path d="M9.5 11l1-5.6 1.5.5.6 6" />
    </svg>
  );
}

export function SwapIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="#3366cc" strokeWidth="1.4">
      <circle cx="16" cy="16" r="15.3" />
      <path d="M9 13h14l-4-4M23 19H9l4 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CalendarIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={INK} strokeWidth="1.3">
      <rect x="3.5" y="5" width="17" height="15" rx="1.5" />
      <path d="M3.5 9.5h17M8 3v4M16 3v4" />
      <g fill={INK} stroke="none">
        <circle cx="8" cy="13" r=".8" />
        <circle cx="12" cy="13" r=".8" />
        <circle cx="16" cy="13" r=".8" />
        <circle cx="8" cy="16.5" r=".8" />
        <circle cx="12" cy="16.5" r=".8" />
        <circle cx="16" cy="16.5" r=".8" />
      </g>
    </svg>
  );
}

export function GoArrowIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="#fff" strokeWidth="1.6">
      <path d="M1.5 5h7M5.5 2l3 3-3 3" />
    </svg>
  );
}

export function ChevronRight({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={INK} strokeWidth="1.5">
      <path d="M6 3l5 5-5 5" />
    </svg>
  );
}
