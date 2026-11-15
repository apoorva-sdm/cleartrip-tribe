import { BusesIcon, FlightsIcon, HotelsIcon } from "@/features/landing";
import type { OfferCategory, OfferData } from "../data/home";
import styles from "./OfferCard.module.css";

const ICONS: Record<OfferCategory, () => JSX.Element> = {
  flights: FlightsIcon,
  hotels: HotelsIcon,
  buses: BusesIcon,
};

export function OfferCard({ offer }: { offer: OfferData }) {
  const Icon = ICONS[offer.category];
  return (
    <article className={styles.card}>
      <span className={styles.icon}>
        <Icon />
      </span>
      <h4 className={styles.title}>{offer.title}</h4>
      <p className={styles.sub}>{offer.sub}</p>
      <p className={styles.tc}>T&amp;C</p>
      <span className={styles.code}>{offer.code}</span>
    </article>
  );
}
