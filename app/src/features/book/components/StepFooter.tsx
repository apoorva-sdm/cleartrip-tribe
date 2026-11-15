import { Button } from "@/ui";
import styles from "./BookSteps.module.css";

interface StepFooterProps {
  addLabel: string;
  onAdd: () => void;
  onSkip: () => void;
  disabled?: boolean;
}

/** Every booking step is optional: add it to the Cleartrip booking, or skip and move on. */
export function StepFooter({ addLabel, onAdd, onSkip, disabled }: StepFooterProps) {
  return (
    <div className={styles.footStack}>
      <Button variant="secondary" block className={styles.tall} onClick={onSkip}>
        Skip: I'll book this myself
      </Button>
      <Button block disabled={disabled} onClick={onAdd}>
        {addLabel}
      </Button>
    </div>
  );
}
