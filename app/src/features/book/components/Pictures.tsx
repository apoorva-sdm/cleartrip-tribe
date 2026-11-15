import type { TravelMode } from "@/domain";
import bus from "@/assets/photos/bus.jpg";
import flight from "@/assets/photos/flight.jpg";
import train from "@/assets/photos/train.jpg";
import hostel from "@/assets/photos/stay-hostel.jpg";
import boutique from "@/assets/photos/stay-boutique.jpg";
import villa from "@/assets/photos/stay-villa.jpg";
import styles from "./Pictures.module.css";

/** Photos for travel and stays (reference images provided for the prototype). */
const TRAVEL: Record<TravelMode, { src: string; alt: string; focus: string }> = {
  flight: { src: flight, alt: "Plane above the clouds", focus: "center 45%" },
  train: { src: train, alt: "Train at a station platform", focus: "center 55%" },
  bus: { src: bus, alt: "KSRTC buses", focus: "center 12%" },
};

export function TravelPicture({ mode }: { mode: TravelMode; carrier?: string }) {
  const { src, alt, focus } = TRAVEL[mode];
  return <img className={styles.photo} src={src} alt={alt} loading="lazy" style={{ objectPosition: focus }} />;
}

export type StayKind = 0 | 1 | 2;

const STAYS: Record<StayKind, { src: string; alt: string }> = {
  0: { src: hostel, alt: "Bunk-bed rooms" },
  1: { src: villa, alt: "Group villa with a private pool" },
  2: { src: boutique, alt: "Boutique stay with a pool and gardens" },
};

/** 0 = backpacker rooms, 1 = group villa, 2 = boutique hotel. */
export function StayPicture({ kind }: { kind: StayKind }) {
  const { src, alt } = STAYS[kind];
  return <img className={styles.photo} src={src} alt={alt} loading="lazy" />;
}
