import { BIG_TILES, SMALL_TILES } from "../data/home";
import { ProductTile } from "./ProductTile";
import { TribeTile } from "./TribeTile";
import styles from "./ProductTiles.module.css";

export function ProductTiles() {
  return (
    <nav className={styles.wrap} aria-label="Book">
      <div className={styles.big}>
        {BIG_TILES.map((tile) => (
          <ProductTile key={tile.id} tile={tile} size="big" />
        ))}
      </div>
      <div className={styles.small}>
        {SMALL_TILES.map((tile) => (
          <ProductTile key={tile.id} tile={tile} size="small" />
        ))}
        <TribeTile />
      </div>
    </nav>
  );
}
