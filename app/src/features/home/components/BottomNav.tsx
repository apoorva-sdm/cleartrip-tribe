import { NavLink } from "react-router-dom";
import { AccountNavIcon, HomeNavIcon, OffersNavIcon, TribeNavIcon, TripsNavIcon, WorkNavIcon } from "./icons";
import styles from "./BottomNav.module.css";

interface NavItem {
  label: string;
  to: string | null;
  icon: (props: { active: boolean }) => JSX.Element;
}

const ITEMS: readonly NavItem[] = [
  { label: "Home", to: "/", icon: HomeNavIcon },
  { label: "My Trips", to: null, icon: TripsNavIcon },
  { label: "My Tribe", to: "/tribe/mine", icon: TribeNavIcon },
  { label: "Work", to: null, icon: WorkNavIcon },
  { label: "Account", to: null, icon: AccountNavIcon },
  { label: "Offers", to: null, icon: OffersNavIcon },
];

/** Dark bottom bar, as on the live mobile site, with My Tribe added after My Trips. */
export function BottomNav() {
  return (
    <nav className={styles.nav} aria-label="Main">
      {ITEMS.map(({ label, to, icon: Icon }) =>
        to ? (
          <NavLink key={label} to={to} end className={({ isActive }) => (isActive ? styles.itemOn : styles.item)}>
            {({ isActive }) => (
              <>
                <Icon active={isActive} />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ) : (
          <button key={label} type="button" className={styles.item}>
            <Icon active={false} />
            <span>{label}</span>
          </button>
        ),
      )}
    </nav>
  );
}
