import { useId, type InputHTMLAttributes, type ReactNode } from "react";
import styles from "./Field.module.css";

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: ReactNode;
  prefix?: string;
}

/** Cleartrip text field: 52px, 1px line, 6px radius. */
export function Field({ label, error, hint, prefix, className, ...input }: FieldProps) {
  const id = useId();
  const messageId = `${id}-msg`;
  return (
    <div className={[styles.field, className].filter(Boolean).join(" ")}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <div className={[styles.box, error && styles.invalid].filter(Boolean).join(" ")}>
        {prefix && <span className={styles.prefix}>{prefix}</span>}
        <input
          id={id}
          className={styles.input}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? messageId : undefined}
          {...input}
        />
      </div>
      {error ? (
        <p id={messageId} className={styles.error} role="alert">
          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
            <circle cx="6" cy="6" r="5.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M6 3.5v3M6 8.4v.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          {error}
        </p>
      ) : (
        hint && (
          <p id={messageId} className={styles.hint}>
            {hint}
          </p>
        )
      )}
    </div>
  );
}
