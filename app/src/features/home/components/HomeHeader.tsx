import { LogoMark } from "@/features/landing";
import styles from "./HomeHeader.module.css";

/** Logo, Login and the Elite pill, as on the Cleartrip mobile site. */
export function HomeHeader() {
  return (
    <header className={styles.header}>
      <span className={styles.logo} aria-label="Cleartrip">
        <LogoMark />
        cleartrip
      </span>
      <div className={styles.actions}>
        <button type="button" className={styles.login}>
          Login
        </button>
        <button type="button" className={styles.elite}>
          <span>Elite</span>
        </button>
      </div>
    </header>
  );
}
