import { useRef } from "react";
import { useCarousel } from "@/features/landing";
import { HERO_PROMO_IDS } from "../data/home";
import { promosById } from "./promoLookup";
import styles from "./HeroCarousel.module.css";

const SLIDES = promosById(HERO_PROMO_IDS);
const SWIPE_PX = 40;

/** Full-width hero banner: slow crossfade with a gentle zoom, swipeable, dots below. */
export function HeroCarousel() {
  const carousel = useCarousel(SLIDES.length);
  const startX = useRef<number | null>(null);

  return (
    <section className={styles.wrap} aria-roledescription="carousel" aria-label="Offers">
      <div
        className={styles.frame}
        onPointerDown={(e) => {
          startX.current = e.clientX;
          carousel.pause();
        }}
        onPointerUp={(e) => {
          const dx = startX.current === null ? 0 : e.clientX - startX.current;
          startX.current = null;
          if (dx <= -SWIPE_PX) carousel.next();
          else if (dx >= SWIPE_PX) carousel.prev();
          else carousel.resume();
        }}
      >
        {SLIDES.map((slide, i) => (
          <div
            key={slide.id}
            className={[styles.slide, i === carousel.index && styles.on].filter(Boolean).join(" ")}
            aria-hidden={i !== carousel.index}
          >
            <img className={styles[`focus-${slide.focus}`]} src={slide.image} alt={slide.alt} draggable={false} />
            <div className={styles.copy}>
              <p className={styles.line1}>{slide.headline[0]}</p>
              <p className={styles.line2}>{slide.headline[1]}</p>
              <p className={styles.note}>{slide.note}</p>
            </div>
          </div>
        ))}
      </div>
      <div className={styles.dots}>
        {SLIDES.map((slide, i) => (
          <button
            key={slide.id}
            type="button"
            className={i === carousel.index ? styles.dotOn : styles.dot}
            aria-label={`Show offer ${i + 1}`}
            aria-current={i === carousel.index}
            onClick={() => carousel.goTo(i)}
          />
        ))}
      </div>
    </section>
  );
}
