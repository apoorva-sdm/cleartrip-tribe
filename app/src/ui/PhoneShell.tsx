import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { PhoneFrame } from "./PhoneFrame";
import styles from "./PhoneShell.module.css";

/** From avatars to the itinerary the app bar stays clean: the page heading says where you are. */
const NO_TITLE = ["Avatars", "Match", "Decide", "Plan"];

interface PhoneShellProps {
  /** Flow stage shown in the app bar, e.g. "Setup". */
  stage: string;
  /** Where the back arrow goes. Defaults to the previous page. */
  backTo?: string;
  children: ReactNode;
  /** Sticky bottom action area. */
  footer?: ReactNode;
}

/** A phone-sized screen, centred on desktop and full screen on phones. */
export function PhoneShell({ stage, backTo, children, footer }: PhoneShellProps) {
  const navigate = useNavigate();
  return (
    <PhoneFrame>
        <header className={styles.bar}>
          <button
            type="button"
            className={styles.back}
            aria-label="Back"
            onClick={() => (backTo ? navigate(backTo) : navigate(-1))}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {!NO_TITLE.includes(stage) && <span className={styles.stage}>{stage}</span>}
          <span className={styles.brand} aria-label="Cleartrip Tribe">
            Tribe
          </span>
        </header>
        <main className={styles.body}>{children}</main>
        {footer && <footer className={styles.footer}>{footer}</footer>}
    </PhoneFrame>
  );
}
