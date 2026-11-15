import { PhoneFrame } from "@/ui";
import { BottomNav } from "./BottomNav";
import { HeroCarousel } from "./HeroCarousel";
import { HomeHeader } from "./HomeHeader";
import { ProductTiles } from "./ProductTiles";
import { PromoStrip } from "./PromoStrip";
import { TopOffers } from "./TopOffers";
import styles from "./MobileHome.module.css";

/** Cleartrip mobile homescreen, recreated from the live site, with Tribe added. */
export function MobileHome() {
  return (
    <PhoneFrame>
      <div className={styles.scroll}>
        <main className={styles.sheet}>
          <HomeHeader />
          <ProductTiles />
          <div className={styles.gap} />
          <HeroCarousel />
          <PromoStrip />
          <TopOffers />
        </main>
      </div>
      <BottomNav />
    </PhoneFrame>
  );
}
