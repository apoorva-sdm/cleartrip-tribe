import styles from "./SiteHeader.module.css";
import {
  BusinessIcon,
  LogoMark,
  MyTribeIcon,
  MyTripsIcon,
  OffersIcon,
  SmallChevronDown,
  SupportIcon,
} from "./icons";

export function SiteHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <div className={styles.logo}>
            <LogoMark />
            cleartrip
          </div>
          <div className={styles.tag}>
            A <b>Flipkart</b> Company
          </div>
        </div>

        <nav className={styles.nav}>
          <div className={styles.navItem}>
            <OffersIcon />
            Offers
          </div>
          <div className={styles.navItem}>
            <BusinessIcon />
            Business
            <SmallChevronDown />
          </div>
          <div className={styles.navItem}>
            <MyTripsIcon />
            My Trips
          </div>
          <div className={styles.navItem} id="my-tribe">
            <MyTribeIcon />
            My Tribe
          </div>
          <div className={styles.navItem}>
            <SupportIcon />
            Support
          </div>
          <button type="button" className={styles.elite}>
            Elite
          </button>
          <button type="button" className={styles.login}>
            Log in
          </button>
        </nav>
      </div>
    </header>
  );
}
