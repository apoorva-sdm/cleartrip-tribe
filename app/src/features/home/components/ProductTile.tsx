import { BusesIcon, FlightsIcon, HolidaysIcon, HotelsIcon } from "@/features/landing";
import type { ProductId, ProductTileData } from "../data/home";
import { TrainsIcon } from "./icons";
import styles from "./ProductTile.module.css";

const ICONS: Record<ProductId, () => JSX.Element> = {
  hotels: HotelsIcon,
  flights: FlightsIcon,
  trains: TrainsIcon,
  buses: BusesIcon,
  holidays: HolidaysIcon,
};

interface ProductTileProps {
  tile: ProductTileData;
  size: "big" | "small";
}

/** A line-of-business tile. Not wired to search in this prototype. */
export function ProductTile({ tile, size }: ProductTileProps) {
  const Icon = ICONS[tile.id];
  return (
    <a href="#" className={[styles.tile, styles[size]].join(" ")} onClick={(e) => e.preventDefault()}>
      {tile.badge && <span className={styles.badge}>{tile.badge}</span>}
      <span className={styles.body}>
        <span className={styles.icon}>
          <Icon />
        </span>
        <span className={styles.title}>{tile.title}</span>
        <span className={styles.sub}>{tile.sub}</span>
      </span>
      {tile.ticker && <span className={styles.ticker}>{tile.ticker}</span>}
    </a>
  );
}
