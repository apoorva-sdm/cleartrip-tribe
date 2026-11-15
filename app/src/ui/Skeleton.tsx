import styles from "./Skeleton.module.css";

interface SkeletonProps {
  width?: number | string;
  height?: number;
  round?: boolean;
}

export function Skeleton({ width = "100%", height = 16, round = false }: SkeletonProps) {
  return (
    <span
      className={[styles.sk, round && styles.round].filter(Boolean).join(" ")}
      style={{ width, height }}
      aria-hidden
    />
  );
}
