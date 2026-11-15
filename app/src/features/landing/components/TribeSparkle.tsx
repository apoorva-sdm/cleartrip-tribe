import { Fragment } from "react";
import styles from "./TribeSparkle.module.css";
import { useSvgId } from "../hooks/useSvgId";
import {
  OUTLINE_LENGTH,
  STREAK_OFFSET,
  TRAIL_SEGMENTS,
  type TribeSparkleState,
} from "../hooks/useTribeSparkle";

/** Tail first, so the brightest segments sit on top. */
const SEGMENT_ORDER = Array.from({ length: TRAIL_SEGMENTS }, (_, n) => TRAIL_SEGMENTS - 1 - n);
const INITIAL_GRADIENT_WIDTH = 107;

/** Streak and star drawn over the Tribe tab outline; render it inside the (positioned) tab. */
export function TribeSparkle({ geometry, sparkRef, glowRefs, coreRefs }: TribeSparkleState) {
  const trailGradId = useSvgId("tribe-grad");
  const starGradId = useSvgId("star-grad");
  const trailStroke = `url(#${trailGradId})`;
  const transform = `translate(${STREAK_OFFSET} ${STREAK_OFFSET})`;

  return (
    <>
      <svg
        className={styles.streak}
        aria-hidden="true"
        width={geometry?.width}
        height={geometry?.height}
      >
        <defs>
          <linearGradient
            id={trailGradId}
            gradientUnits="userSpaceOnUse"
            x1="0"
            y1="0"
            x2={geometry?.width ?? INITIAL_GRADIENT_WIDTH}
            y2="0"
          >
            <stop offset="0" stopColor="#e0309f" />
            <stop offset="1" stopColor="#ff5a36" />
          </linearGradient>
        </defs>
        {SEGMENT_ORDER.map((i) => (
          <Fragment key={i}>
            <path
              ref={(el) => {
                glowRefs.current[i] = el;
              }}
              pathLength={OUTLINE_LENGTH}
              stroke={trailStroke}
              d={geometry?.d}
              transform={geometry ? transform : undefined}
            />
            <path
              ref={(el) => {
                coreRefs.current[i] = el;
              }}
              pathLength={OUTLINE_LENGTH}
              stroke={trailStroke}
              d={geometry?.d}
              transform={geometry ? transform : undefined}
            />
          </Fragment>
        ))}
      </svg>
      <i
        ref={sparkRef}
        className={styles.spark}
        aria-hidden="true"
        style={geometry ? { offsetPath: `path("${geometry.d}")` } : undefined}
      >
        <svg viewBox="0 0 24 24">
          <defs>
            <linearGradient id={starGradId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#e0309f" />
              <stop offset="1" stopColor="#ff5a36" />
            </linearGradient>
          </defs>
          <path
            d="M12 0C12.9 7.2 16.8 11.1 24 12 16.8 12.9 12.9 16.8 12 24 11.1 16.8 7.2 12.9 0 12 7.2 11.1 11.1 7.2 12 0Z"
            fill={`url(#${starGradId})`}
          />
        </svg>
      </i>
    </>
  );
}
