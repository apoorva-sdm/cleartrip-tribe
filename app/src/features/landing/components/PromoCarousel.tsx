import styles from "./PromoCarousel.module.css";
import { cx } from "./cx";
import { GoArrowIcon } from "./icons";
import { useCarousel } from "../hooks/useCarousel";
import { PROMOS, type PromoFocus } from "../data/promos";

const FOCUS_CLASS: Record<PromoFocus, string | undefined> = {
  center: undefined,
  right: styles.focusRight,
  high: styles.focusHigh,
  low: styles.focusLow,
};

/** Slow crossfade with a gentle zoom; captions rise in after the image settles. */
export function PromoCarousel() {
  const { index, goTo, prev, next, pause, resume } = useCarousel(PROMOS.length);

  return (
    <div
      className={styles.promo}
      aria-roledescription="carousel"
      onMouseEnter={pause}
      onMouseLeave={resume}
    >
      {PROMOS.map((promo, n) => (
        <div key={promo.id} className={cx(styles.slide, n === index && styles.on)}>
          <img src={promo.image} alt={promo.alt} className={FOCUS_CLASS[promo.focus]} />
          <h4>
            {promo.headline[0]}
            <br />
            {promo.headline[1]}
          </h4>
          <div className={styles.note}>{promo.note}</div>
        </div>
      ))}
      <a className={styles.go} href="#" aria-label="See offer">
        <GoArrowIcon />
      </a>
      <div className={styles.dots}>
        <button type="button" className={styles.arr} aria-label="Previous" onClick={prev}>
          {"‹"}
        </button>
        {PROMOS.map((promo, n) => (
          <button
            key={promo.id}
            type="button"
            className={cx(n === index && styles.on)}
            aria-label={`Slide ${n + 1}`}
            onClick={() => goTo(n)}
          />
        ))}
        <button type="button" className={styles.arr} aria-label="Next" onClick={next}>
          {"›"}
        </button>
      </div>
    </div>
  );
}
