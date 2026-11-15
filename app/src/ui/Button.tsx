import { motion } from "motion/react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./Button.module.css";

type Variant = "primary" | "secondary" | "dark" | "text" | "tertiary";

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onAnimationStart" | "onDrag" | "onDragStart" | "onDragEnd"> {
  variant?: Variant;
  block?: boolean;
  loading?: boolean;
  icon?: ReactNode;
}

export function Button({ variant = "primary", block = false, loading = false, icon, children, className, disabled, ...rest }: ButtonProps) {
  const classes = [styles.btn, styles[variant], block && styles.block, className].filter(Boolean).join(" ");
  return (
    <motion.button
      whileTap={disabled || loading ? undefined : { scale: 0.97 }}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <span className={styles.spinner} aria-hidden /> : icon}
      <span>{children}</span>
    </motion.button>
  );
}
