import styles from "./EliteBanner.module.css";

export function EliteBanner() {
  return (
    <div className={styles.banner}>
      <div className={styles.top}>
        <span className={styles.pill}>Elite</span>
        <span className={styles.membership}>Membership</span>
      </div>
      <div className={styles.row}>
        <h3 className={styles.headline}>Change dates at just ₹9</h3>
        <div className={styles.eligibility}>
          Check your eligibility now <button type="button">Login</button>
        </div>
      </div>
      <svg className={styles.cal} width="0" height="0" />
    </div>
  );
}
