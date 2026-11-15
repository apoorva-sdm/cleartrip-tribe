import styles from "./FlightSearchCard.module.css";
import { cx } from "./cx";
import {
  CalendarIcon,
  ChevronDown,
  LandingIcon,
  SwapIcon,
  TakeOffIcon,
  TrackPlaneIcon,
  TravellerIcon,
} from "./icons";

const SPECIAL_FARES = [
  { label: "Student", perk: "Extra baggage, discounts" },
  { label: "Senior citizen", perk: "Up to ₹600 off" },
  { label: "Armed forces", perk: "Up to ₹600 off" },
] as const;

/** Static flight search form, as on the Cleartrip home page. Not wired up. */
export function FlightSearchCard() {
  return (
    <div className={styles.card}>
      <div className={styles.row1}>
        <label className={styles.radio}>
          <i />
          One way
        </label>
        <label className={cx(styles.radio, styles.on)}>
          <i />
          Round trip
        </label>
        <div className={styles.vsep} />
        <div className={styles.pax}>
          <TravellerIcon />
          1 Adult, Economy
          <ChevronDown />
        </div>
        <div className={styles.track}>
          <TrackPlaneIcon />
          Track flights
        </div>
      </div>

      <div className={styles.ft}>
        <div className={styles.f}>
          <TakeOffIcon />
          AMD - Ahmedabad, IN
        </div>
        <div className={styles.f}>
          <LandingIcon />
          DEL - New Delhi, IN
        </div>
        <div className={styles.swap}>
          <SwapIcon />
        </div>
      </div>

      <div className={styles.dates}>
        <div className={styles.d}>
          <CalendarIcon />
          Tue, Nov 17
        </div>
        <div className={styles.d}>Tue, Nov 17</div>
      </div>

      <div className={styles.fares}>
        <div className={styles.biz}>
          <span className={styles.cbx} />
          <div>
            <p>Business Fares by Cleartrip</p>
            <div className={styles.g}>Unlock 10% extra savings</div>
          </div>
          <span className={styles.save}>SAVE MORE</span>
        </div>
        <div className={styles.fsep} />
        <div className={styles.chips}>
          {SPECIAL_FARES.map(({ label, perk }) => (
            <div key={label} className={styles.chip}>
              {label}
              <div className={styles.g}>{perk}</div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.bottom}>
        <div className={styles.tgl}>
          <i />
          Non-stop flights only
        </div>
        <button type="button" className={styles.search}>
          Search Flights
        </button>
      </div>
    </div>
  );
}
