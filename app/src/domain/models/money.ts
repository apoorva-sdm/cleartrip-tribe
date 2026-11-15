import type { Paise } from "./types";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export const Money = {
  fromRupees(rupees: number): Paise {
    return Math.round(rupees * 100);
  },
  toRupees(paise: Paise): number {
    return paise / 100;
  },
  /** ₹1,24,500 */
  format(paise: Paise): string {
    return inr.format(paise / 100);
  },
} as const;
