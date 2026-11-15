import { STRIP_PROMO_IDS } from "../data/home";
import { promosById } from "./promoLookup";
import styles from "./PromoStrip.module.css";

const CARDS = promosById(STRIP_PROMO_IDS);

/** Three small photo cards under the hero. */
export function PromoStrip() {
  return (
    <section className={styles.strip} aria-label="More to explore">
      {CARDS.map((card) => (
        <a key={card.id} href="#" className={styles.card} onClick={(e) => e.preventDefault()}>
          <img className={styles[`focus-${card.focus}`]} src={card.image} alt={card.alt} />
          <span className={styles.copy}>
            <span className={styles.line1}>{card.headline[0]}</span>
            <span className={styles.line2}>{card.headline[1]}</span>
          </span>
        </a>
      ))}
    </section>
  );
}
