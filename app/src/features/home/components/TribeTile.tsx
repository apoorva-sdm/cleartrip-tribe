import { useRef } from "react";
import { Link } from "react-router-dom";
import { TribeSparkle, useTribeSparkle } from "@/features/landing";
import styles from "./TribeTile.module.css";

const TILE_RADIUS = 16;

/** Tribe entry on the mobile homescreen: a product tile with the gradient outline and sparkle. */
export function TribeTile() {
  const ref = useRef<HTMLAnchorElement>(null);
  const sparkle = useTribeSparkle(ref, TILE_RADIUS);
  return (
    <Link ref={ref} to="/tribe/start" className={styles.tile}>
      <span className={styles.icon}>
        <img src="/img/tribe.webp" alt="" />
      </span>
      <span className={styles.title}>Tribe</span>
      <span className={styles.sub}>Plan together</span>
      <TribeSparkle {...sparkle} />
    </Link>
  );
}
