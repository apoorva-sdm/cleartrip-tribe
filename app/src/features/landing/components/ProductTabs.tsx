import type { ComponentType } from "react";
import styles from "./ProductTabs.module.css";
import { cx } from "./cx";
import { BusesIcon, FlightsIcon, HolidaysIcon, HotelsIcon } from "./productIcons";
import { TribeTab } from "./TribeTab";

interface ProductTab {
  readonly label: string;
  readonly Icon: ComponentType;
}

const PRODUCTS: readonly ProductTab[] = [
  { label: "Flights", Icon: FlightsIcon },
  { label: "Hotels", Icon: HotelsIcon },
  { label: "Buses", Icon: BusesIcon },
  { label: "Holidays", Icon: HolidaysIcon },
];

const SELECTED = "Flights";

export function ProductTabs() {
  return (
    <div className={styles.tabs}>
      {PRODUCTS.map(({ label, Icon }) => (
        <div key={label} className={cx(styles.tab, label === SELECTED && styles.on)}>
          <Icon />
          {label}
        </div>
      ))}
      <TribeTab />
    </div>
  );
}
