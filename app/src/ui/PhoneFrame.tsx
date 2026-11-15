import type { ReactNode } from "react";
import styles from "./PhoneFrame.module.css";

interface PhoneFrameProps {
  children: ReactNode;
  className?: string;
}

/** A 390px phone, centred on desktop and full screen on real phones. Children lay out in a column. */
export function PhoneFrame({ children, className }: PhoneFrameProps) {
  return (
    <div className={styles.page}>
      <div className={styles.device}>
        <div className={[styles.phone, className].filter(Boolean).join(" ")}>{children}</div>
      </div>
    </div>
  );
}
