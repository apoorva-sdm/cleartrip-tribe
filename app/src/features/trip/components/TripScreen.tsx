import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { Money, SLOT_START, formatDay } from "@/domain";
import { bookOnTrip } from "@/features/book/slice";
import { AgentMark, Button, ChoiceChip, PhoneShell, ScreenTitle, Sheet } from "@/ui";
import { BeenThereLink } from "@/features/match";
import { usePlaceInfo } from "../hooks/usePlaceInfo";
import { dismissChange, reconfirmChange, reportChange } from "../slice";
import styles from "./TripScreen.module.css";

type Tab = "today" | "book" | "contacts";

/** Trip · Live trip mode: today's plan, on-the-spot booking, plan or crew changes, contacts and safety. */
export function TripScreen() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { bookedVia, lines, bookedLineIds, picks, bookedOnTrip, travellers } = useAppSelector((s) => s.book);
  const plan = useAppSelector((s) => s.plan);
  const locked = useAppSelector((s) => s.decide.locked);
  const meId = useAppSelector((s) => s.group.meId) ?? "me";
  const { change, log } = useAppSelector((s) => s.live);
  const [tab, setTab] = useState<Tab>("today");
  const [day, setDay] = useState(0);
  const [sheet, setSheet] = useState(false);
  const [working, setWorking] = useState(false);
  const [bookingKey, setBookingKey] = useState<string | null>(null);
  const [contactOpen, setContactOpen] = useState(false);
  const { contact, safety, onTheGo } = usePlaceInfo(locked?.place.id);

  if (!plan.itinerary || !locked) return <Navigate to="/tribe/plan" replace />;
  if (!bookedVia) return <Navigate to="/tribe/trip/ready" replace />;

  const size = travellers.length || 1;
  const ids = travellers.map((t) => t.memberId);
  const items = plan.itinerary.items.filter((i) => i.day === day);
  const templateOf = (id: string) => plan.catalogue.find((t) => t.id === id);
  const activitiesBooked = bookedLineIds.includes("activities");

  const book = async (key: string, title: string, amount: number) => {
    setBookingKey(key);
    await dispatch(bookOnTrip({ key, title, amount, paidBy: meId, splitAmong: ids }));
    setBookingKey(null);
  };
  const report = async (kind: "weather" | "dropout") => {
    setSheet(false);
    setWorking(true);
    await dispatch(reportChange({ kind, day }));
    setWorking(false);
  };
  const reconfirm = async () => {
    setWorking(true);
    await dispatch(reconfirmChange());
    setWorking(false);
  };

  return (
    <PhoneShell stage="Trip" backTo="/tribe/trip/ready" footer={<Button block onClick={() => navigate("/tribe/trip/split")}>Trip over? Split costs</Button>}>
      <ScreenTitle title={`You're in ${locked.place.name}!`}>If plans change, Tribe works out a new plan and your tribe agrees.</ScreenTitle>

      <div className={styles.tabs} role="tablist">
        <ChoiceChip mode="radio" selected={tab === "today"} onClick={() => setTab("today")}>Today</ChoiceChip>
        <ChoiceChip mode="radio" selected={tab === "book"} onClick={() => setTab("book")}>Book on the go</ChoiceChip>
        <ChoiceChip mode="radio" selected={tab === "contacts"} onClick={() => setTab("contacts")}>Contacts</ChoiceChip>
      </div>

      {tab === "today" && (
        <>
          <div className={styles.days}>
            {plan.itinerary.days.map((d, i) => (
              <ChoiceChip key={d} mode="radio" selected={day === i} onClick={() => setDay(i)}>
                Day {i + 1} · {formatDay(d)}
              </ChoiceChip>
            ))}
          </div>

          <ol className={styles.timeline}>
            {items.map((i) => {
              const t = i.kind === "moment" ? templateOf(i.templateId) : undefined;
              const key = i.kind === "moment" ? `${i.id}:${i.templateId}` : "";
              const booked =
                i.kind === "moment" && (bookedOnTrip.includes(key) || (activitiesBooked && i.locked && picks.activities.includes(i.id)));
              return (
                <li key={i.id} className={styles.stop}>
                  <span className={styles.time}>{SLOT_START[i.slot]}</span>
                  <span className={styles.dot} aria-hidden />
                  <span className={styles.what}>
                    {t ? t.title : <em>Free time</em>}
                    {t && booked && <span className={styles.lock}>Booked 🔒</span>}
                    {t && !booked && t.pricePerPerson === 0 && <span className={styles.free}>Free · just show up</span>}
                    {t && !booked && t.pricePerPerson > 0 && (
                      <button
                        type="button"
                        className={styles.bookNow}
                        disabled={bookingKey !== null}
                        onClick={() => book(key, t.title, t.pricePerPerson * size)}
                      >
                        {bookingKey === key ? "Booking…" : `Book now · ${Money.format(t.pricePerPerson)} each`}
                      </button>
                    )}
                  </span>
                </li>
              );
            })}
          </ol>

          {change ? (
            <section className={styles.change} aria-live="polite">
              <p className={styles.changeTag}>
                <AgentMark size={10} /> Recalculated
              </p>
              <h2 className={styles.changeH}>{change.title}</h2>
              {change.prices && change.prices.length > 0 && (
                <table className={styles.reprice}>
                  <tbody>
                    {change.prices.map((p) => (
                      <tr key={p.label}>
                        <th scope="row">{p.label}</th>
                        <td>{Money.format(p.was)}</td>
                        <td>→</td>
                        <td>
                          <b>{Money.format(p.now)}</b>
                          {p.now !== p.was && <em> +{Money.format(p.now - p.was)}</em>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {change.lines.map((l) => (
                <p key={l} className={styles.changeLine}>{l}</p>
              ))}
              <div className={styles.changeActions}>
                <Button variant="secondary" className={styles.tall} onClick={() => dispatch(dismissChange())}>Keep plan</Button>
                <Button className={styles.grow} loading={working} onClick={reconfirm}>Agree with tribe</Button>
              </div>
            </section>
          ) : (
            <Button variant="secondary" block className={styles.tall} loading={working} onClick={() => setSheet(true)}>
              Something changed?
            </Button>
          )}
          {log[0] && <p className={styles.log}>{log[0]}</p>}
        </>
      )}

      {tab === "book" && (
        <>
          <p className={styles.sub}>Book on the spot. It lands in the split automatically.</p>
          <ul className={styles.otg}>
            {onTheGo.map((o) => {
              const done = bookedOnTrip.includes(o.id);
              return (
                <li key={o.id} className={styles.otgItem}>
                  <div>
                    <b>{o.title}</b>
                    <span>{o.detail}</span>
                  </div>
                  <button type="button" className={done ? styles.otgDone : styles.bookNow} disabled={done || bookingKey !== null} onClick={() => book(o.id, o.title, o.price)}>
                    {done ? "Booked ✓" : bookingKey === o.id ? "Booking…" : o.price ? `${Money.format(Math.round(o.price / size))} each` : "Reserve"}
                  </button>
                </li>
              );
            })}
          </ul>
          <p className={styles.sample}>Sample options and prices. Nothing is really booked.</p>
        </>
      )}

      {tab === "contacts" && (
        <>
          <p className={styles.offline}>Saved for offline</p>
          {lines.length > 0 && (
            <>
              <h3 className={styles.h3}>On Cleartrip</h3>
              <ul className={styles.booked}>
                {lines.map((l) => (
                  <li key={l.id}>
                    <b>{l.title}</b>
                    <span>
                      {l.chosen.label}
                      {l.chosen.legs && ` · ${l.chosen.legs.out.code} · ${l.chosen.legs.out.gate}`}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
          {contact && (
            <>
              <h3 className={styles.h3}>Local contact</h3>
              <section className={styles.contact}>
                <a
                  className={styles.contactLink}
                  href={`#contact-${locked.place.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setContactOpen(true);
                  }}
                >
                  {contact.name} ↗
                </a>
                <p className={styles.contactRole}>{contact.role}</p>
                <dl className={styles.facts}>
                  <div><dt>Price range</dt><dd>{contact.priceRange}</dd></div>
                  <div><dt>Languages</dt><dd>{contact.languages}</dd></div>
                  <div><dt>Prefers</dt><dd>{contact.channel}</dd></div>
                </dl>
              </section>
            </>
          )}
          <h3 className={styles.h3}>Reviews</h3>
          <BeenThereLink place={locked.place} />
          <h3 className={styles.h3}>Safety</h3>
          <ul className={styles.safety}>
            {safety.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
          <p className={styles.sample}>Sample contacts and notes.</p>
        </>
      )}

      <Sheet open={contactOpen} title={contact ? `Contact ${contact.name}` : "Contact"} onClose={() => setContactOpen(false)}>
        {contact && (
          <div className={styles.contactSheet}>
            <p className={styles.contactRole}>{contact.role}</p>
            <dl className={styles.facts}>
              <div><dt>Price range</dt><dd>{contact.priceRange}</dd></div>
              <div><dt>Languages</dt><dd>{contact.languages}</dd></div>
              <div><dt>Prefers</dt><dd>{contact.channel}</dd></div>
            </dl>
            <a className={styles.contactCta} href={`#message-${contact.name}`} onClick={(e) => e.preventDefault()}>
              {contact.channel === "Phone call" ? `Call ${contact.name}` : `Message on ${contact.channel}`} ↗
            </a>
            <p className={styles.sample}>Sample contact for the prototype. In the app this would {contact.channel === "Phone call" ? "start a call" : `open ${contact.channel}`}. Contacts can't pay to be listed.</p>
          </div>
        )}
      </Sheet>

      <Sheet open={sheet} title="What changed?" onClose={() => setSheet(false)}>
        <div className={styles.options}>
          <button type="button" className={styles.option} onClick={() => report("weather")}>
            <b>☔ Rain or a closure</b>
            <span>Swap outdoor plans for indoor ones</span>
          </button>
          <button type="button" className={styles.option} onClick={() => report("dropout")}>
            <b>🙋 Someone drops out</b>
            <span>Re-split shared costs. Nobody's named.</span>
          </button>
        </div>
      </Sheet>
    </PhoneShell>
  );
}
