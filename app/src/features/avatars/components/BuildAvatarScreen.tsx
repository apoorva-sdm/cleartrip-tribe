import { AnimatePresence, motion, useAnimationControls } from "motion/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  AVATAR_ITEMS,
  DEFAULT_LOOK,
  EMPTY_AVATAR,
  LOADOUT_SIZE,
  getItemInfo,
  loadoutGap,
  setLock,
  toggleItem,
  type Avatar,
  type AvatarLook,
  type ItemId,
} from "@/domain";
import { Button, ChoiceChip, Field, PhoneShell } from "@/ui";
import { duration, ease, spring } from "@/styles/motion";
import { saveMyAvatar } from "../slice";
import { selectSaveStatus } from "../selectors";
import { AvatarFigure } from "./AvatarFigure";
import { ItemIcon } from "./ItemIcon";
import { ItemTile } from "./ItemTile";
import { LockIcon } from "./LockIcon";
import { LockPicker } from "./LockPicker";
import { LookPicker } from "./LookPicker";
import styles from "./BuildAvatarScreen.module.css";

const CAPTION_MS = 1200;
type Tab = "look" | "picks";

/** Avatars · Build avatars: a look, 5 trip picks, and one lock. */
export function BuildAvatarScreen() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const save = useAppSelector(selectSaveStatus);
  const [tab, setTab] = useState<Tab>("look");
  const [name, setName] = useState("");
  const [look, setLook] = useState<AvatarLook>(DEFAULT_LOOK);
  const [avatar, setAvatar] = useState<Avatar>(EMPTY_AVATAR);
  const [caption, setCaption] = useState<ItemId | null>(null);
  const [full, setFull] = useState(false);
  const counter = useAnimationControls();

  const toggle = (id: ItemId) => {
    const result = toggleItem(avatar, id);
    if (result.kind === "full") {
      setFull(true);
      void counter.start({ x: [0, -4, 4, -2, 0], transition: { duration: 0.32 } });
      return;
    }
    setFull(false);
    const added = !avatar.items.includes(id);
    setAvatar(result.avatar);
    if (added) {
      setCaption(id);
      window.setTimeout(() => setCaption((c) => (c === id ? null : c)), CAPTION_MS);
    }
  };

  const gap = loadoutGap(avatar);
  const reason = !name.trim()
    ? "Add your name"
    : gap === "items"
      ? `${LOADOUT_SIZE - avatar.items.length} more to pick`
      : gap === "lock"
        ? "Choose your must-have"
        : null;

  const submit = async () => {
    const action = await dispatch(saveMyAvatar({ name, avatar: { ...avatar, look } }));
    if (saveMyAvatar.fulfilled.match(action)) navigate("/tribe/crew");
  };

  const footer =
    tab === "look" ? (
      <Button block disabled={!name.trim()} onClick={() => setTab("picks")}>
        {name.trim() ? "Next: Trip picks" : "Add your name"}
      </Button>
    ) : (
      <>
        {save.kind === "error" ? (
          <p className={styles.error} role="alert">{save.message}</p>
        ) : (
          reason && <p className={styles.reason}>{reason}</p>
        )}
        <Button block disabled={reason !== null} loading={save.kind === "busy"} onClick={submit}>
          I'm ready
        </Button>
      </>
    );

  return (
    <PhoneShell stage="Avatars" backTo="/tribe/share" footer={footer}>
      <div className={styles.preview}>
        <AvatarFigure name={name || "You"} avatar={{ ...avatar, look, items: tab === "picks" ? [] : avatar.items }} size={150} badges={false} />
        {tab === "picks" && (
          <ul className={styles.slots} aria-label={`Your picks, ${avatar.items.length} of ${LOADOUT_SIZE}`}>
            {Array.from({ length: LOADOUT_SIZE }, (_, i) => {
              const item = avatar.items[i];
              const locked = item !== undefined && item === avatar.lockedItemId;
              return (
                <li key={item ?? `empty-${i}`} className={item ? (locked ? styles.slotLocked : styles.slotOn) : styles.slot}>
                  {item && (
                    <motion.span
                      className={styles.slotArt}
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1, transition: spring.pop }}
                    >
                      <ItemIcon id={item} size={30} />
                    </motion.span>
                  )}
                  {locked && (
                    <span className={styles.slotLock}>
                      <LockIcon size={9} />
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
        <div className={styles.captionSlot} aria-live="polite">
          <AnimatePresence>
            {caption && (
              <motion.p
                key={caption}
                className={styles.caption}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0, transition: { duration: duration.base, ease: ease.out } }}
                exit={{ opacity: 0, transition: { duration: duration.quick } }}
              >
                + {getItemInfo(caption).label} · {getItemInfo(caption).meaning.toLowerCase()}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className={styles.tabs} role="tablist">
        <ChoiceChip mode="radio" selected={tab === "look"} onClick={() => setTab("look")}>1 · Your look</ChoiceChip>
        <ChoiceChip mode="radio" selected={tab === "picks"} onClick={() => setTab("picks")}>
          2 · Trip picks {avatar.items.length}/{LOADOUT_SIZE}
        </ChoiceChip>
      </div>

      {tab === "look" ? (
        <>
          <Field label="Your name" placeholder="What your tribe calls you" value={name} maxLength={24} autoComplete="given-name" onChange={(e) => setName(e.target.value)} />
          <div className={styles.lookGap} />
          <LookPicker look={look} seed={name || "You"} onChange={setLook} />
        </>
      ) : (
        <>
          <section aria-labelledby="picks-h">
            <div className={styles.sectionHead}>
              <h2 id="picks-h" className={styles.h2}>Pick {LOADOUT_SIZE} things you'd love to do</h2>
              <motion.span animate={counter} className={styles.count}>
                {full ? "That's 5! Swap one out" : `${avatar.items.length}/${LOADOUT_SIZE}`}
              </motion.span>
            </div>
            <div className={styles.grid}>
              {AVATAR_ITEMS.map((item) => (
                <ItemTile key={item.id} item={item} selected={avatar.items.includes(item.id)} onToggle={() => toggle(item.id)} />
              ))}
            </div>
          </section>

          <AnimatePresence>
            {avatar.items.length === LOADOUT_SIZE && (
              <LockPicker items={avatar.items} lockedItemId={avatar.lockedItemId} onLock={(id) => setAvatar((a) => setLock(a, id))} />
            )}
          </AnimatePresence>
        </>
      )}
    </PhoneShell>
  );
}
