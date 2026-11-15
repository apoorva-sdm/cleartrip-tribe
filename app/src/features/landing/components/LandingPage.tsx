import styles from "./LandingPage.module.css";
import { EliteBanner } from "./EliteBanner";
import { FlightSearchCard } from "./FlightSearchCard";
import { MoreOffers } from "./MoreOffers";
import { ProductTabs } from "./ProductTabs";
import { PromoCarousel } from "./PromoCarousel";
import { SiteHeader } from "./SiteHeader";

/** Cleartrip home page (flights), with the Tribe tab as the entry to group trip planning. */
export function LandingPage() {
  return (
    <>
      <SiteHeader />
      <ProductTabs />
      <main className={styles.main}>
        <section className={styles.left}>
          <h1 className={styles.title}>Book Domestic &amp; International Flight Tickets</h1>
          <p className={styles.sub}>Enjoy hassle free flight ticket bookings at lowest airfare</p>
          <FlightSearchCard />
          <EliteBanner />
        </section>
        <aside className={styles.right}>
          <PromoCarousel />
          <MoreOffers />
        </aside>
      </main>
    </>
  );
}
