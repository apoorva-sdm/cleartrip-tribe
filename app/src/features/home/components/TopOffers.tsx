import { useState } from "react";
import { OFFERS, OFFER_FILTERS, type OfferFilter } from "../data/home";
import { BusChipIcon, HotelChipIcon, PlaneChipIcon, SparklesChipIcon } from "./icons";
import { OfferCard } from "./OfferCard";
import styles from "./TopOffers.module.css";

const CHIP_ICONS: Record<OfferFilter, () => JSX.Element> = {
  "for-you": SparklesChipIcon,
  flights: PlaneChipIcon,
  hotels: HotelChipIcon,
  buses: BusChipIcon,
};

/** "Top Offers" with filter chips and a sideways-scrolling row of offer cards. */
export function TopOffers() {
  const [filter, setFilter] = useState<OfferFilter>("for-you");
  const offers = filter === "for-you" ? OFFERS : OFFERS.filter((o) => o.category === filter);

  return (
    <section className={styles.section} aria-labelledby="top-offers-h">
      <h3 id="top-offers-h" className={styles.title}>
        Top Offers
      </h3>
      <div className={styles.chips} role="tablist" aria-label="Offer type">
        {OFFER_FILTERS.map(({ id, label }) => {
          const Icon = CHIP_ICONS[id];
          const on = id === filter;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={on}
              className={on ? styles.chipOn : styles.chip}
              onClick={() => setFilter(id)}
            >
              <Icon />
              {label}
            </button>
          );
        })}
      </div>
      <div className={styles.cards} role="tabpanel">
        {offers.length > 0 ? (
          offers.map((offer) => <OfferCard key={offer.id} offer={offer} />)
        ) : (
          <p className={styles.empty}>No offers here right now.</p>
        )}
      </div>
    </section>
  );
}
