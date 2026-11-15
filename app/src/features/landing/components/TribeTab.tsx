import { useRef } from "react";
import { Link } from "react-router-dom";
import styles from "./TribeTab.module.css";
import { TribeSparkle } from "./TribeSparkle";
import { useTribeSparkle } from "../hooks/useTribeSparkle";

export const TRIBE_START_PATH = "/tribe/start";

/** Entry point to group trip planning: a product tab with the Tribe gradient outline and sparkle. */
export function TribeTab() {
  const tabRef = useRef<HTMLAnchorElement>(null);
  const sparkle = useTribeSparkle(tabRef);
  return (
    <Link ref={tabRef} to={TRIBE_START_PATH} className={styles.tribe}>
      <div className={styles.icon}>
        <img src="/img/tribe.webp" alt="Three friends with arms around each other" />
      </div>
      <span className={styles.label}>Tribe</span>
      <TribeSparkle {...sparkle} />
    </Link>
  );
}
