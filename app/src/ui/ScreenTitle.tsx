import type { ReactNode } from "react";
import styles from "./ScreenTitle.module.css";

interface ScreenTitleProps {
  title: string;
  children?: ReactNode;
}

export function ScreenTitle({ title, children }: ScreenTitleProps) {
  return (
    <div className={styles.wrap}>
      <h1 className={styles.title}>{title}</h1>
      {children && <p className={styles.sub}>{children}</p>}
    </div>
  );
}
