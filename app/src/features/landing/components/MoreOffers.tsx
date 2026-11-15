import styles from "./MoreOffers.module.css";
import { ChevronRight } from "./icons";

export function MoreOffers() {
  return (
    <>
      <div className={styles.heading}>
        <b>More offers</b>
        <a href="#">View all</a>
      </div>
      <div className={styles.offer}>
        <h5>Get a Flat 7% off on Flights</h5>
        <p>Get a Flat 7% off on Flights with with HDFC Regalia and Millennia Credit Cards!</p>
        <p>Book Now!</p>
        <a href="#">Know more</a>
        <div className={styles.dots}>
          <i className={styles.on} />
          <i />
        </div>
        <ChevronRight className={styles.arrow} />
      </div>
    </>
  );
}
