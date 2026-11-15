import { useNavigate } from "react-router-dom";
import { useAppSelector } from "@/app/hooks";
import { Money, formatDay, formatDayTime, nightsBetween } from "@/domain";
import { AgentMark, Button, PhoneShell, ScreenTitle, Toast, useToast } from "@/ui";
import { selectShareLink, selectTrip } from "../selectors";
import styles from "./ShareLinkScreen.module.css";

/** Setup · Make share link. One link, no login. */
export function ShareLinkScreen() {
  const navigate = useNavigate();
  const trip = useAppSelector(selectTrip);
  const link = useAppSelector(selectShareLink);
  const toast = useToast();

  if (!trip || !link) return null;
  const { window: dates, deadline, capPerPerson } = trip.frame;
  const nights = nightsBetween(dates.start, dates.end);
  const whatsappText = encodeURIComponent(`Planning a trip together. Build your avatar in under a minute, no login: https://${link}`);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`https://${link}`);
      toast.show("Link copied");
    } catch {
      toast.show("Couldn't copy. Press and hold the link to copy it.");
    }
  };

  return (
    <PhoneShell
      stage="Setup"
      backTo="/tribe/start"
      footer={
        <Button block onClick={() => navigate("/tribe/avatar")}>
          Build your avatar
        </Button>
      }
    >
      <ScreenTitle title="Your tribe link is ready">Share it in your group chat. No login, and joining takes a minute.</ScreenTitle>

      <section className={styles.card} aria-label="Trip link">
        <p className={styles.made}>
          <AgentMark /> Made by Tribe
        </p>
        <div className={styles.linkRow}>
          <span className={styles.link}>{link}</span>
          <Button variant="dark" onClick={copy}>
            Copy
          </Button>
        </div>
        <a className={styles.wa} href={`https://wa.me/?text=${whatsappText}`} target="_blank" rel="noreferrer">
          Share on WhatsApp
        </a>
      </section>

      <dl className={styles.frame}>
        <div className={styles.row}>
          <dt>Trip dates</dt>
          <dd>
            {formatDay(dates.start)} – {formatDay(dates.end)}
            <span className={styles.meta}>
              {nights} {nights === 1 ? "night" : "nights"}
            </span>
          </dd>
        </div>
        <div className={styles.row}>
          <dt>Avatars ready by</dt>
          <dd>{formatDayTime(deadline)}</dd>
        </div>
        <div className={styles.row}>
          <dt>Budget per person</dt>
          <dd>{Money.format(capPerPerson)}</dd>
        </div>
      </dl>

      <Toast message={toast.message} />
    </PhoneShell>
  );
}
