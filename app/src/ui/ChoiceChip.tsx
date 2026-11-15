import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./ChoiceChip.module.css";

interface ChoiceChipProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
  selected: boolean;
  icon?: ReactNode;
  /** "radio" for one-of-many, "checkbox" for multi-select. */
  mode?: "radio" | "checkbox";
}

/** Cleartrip filter chip (as in Top Offers): 32px pill, 1.5px border; selected = grey fill + ink border. */
export function ChoiceChip({ selected, icon, mode = "checkbox", children, className, ...rest }: ChoiceChipProps) {
  return (
    <button
      type="button"
      role={mode}
      aria-checked={selected}
      className={[selected ? styles.on : styles.chip, className].filter(Boolean).join(" ")}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}
