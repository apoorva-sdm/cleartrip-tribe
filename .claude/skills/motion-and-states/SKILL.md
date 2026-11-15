---
name: motion-and-states
description: Micro-interactions, animation rules and the empty / loading / error / edge states for every Cleartrip Tribe screen. Built with Motion (motion/react) and, for the crew scene only, React Three Fiber. Load before adding any animation or any screen state.
---

# Motion and states

Motion is **gentle and purposeful**: it explains what changed, who did it and what happens
next. Nothing moves just to look busy. The brief gives extra credit for micro-interactions and
for empty, loading and error states, so every screen ships with all of them.

## Library

- **Motion** for all UI animation: `import { motion, AnimatePresence, LayoutGroup, useReducedMotion } from "motion/react"`.
- **CSS** for tiny hover and press feedback (transform and opacity only).
- **React Three Fiber** only for the crew scene (lazy route, `frameloop="demand"`).
- Do not add GSAP, Lottie or anime.js. Use one animation system.

## Tokens (`src/styles/motion.ts`)

```ts
export const duration = {
  tap: 0.12,      // press feedback
  quick: 0.2,     // hovers, toggles, chip select
  base: 0.32,     // cards entering, sheets
  reveal: 0.6,    // avatar reveal, overlap count
  slow: 1.2,      // carousel crossfade, ambient
} as const;

export const ease = {
  out: [0.2, 0.8, 0.2, 1],        // default for entering
  inOut: [0.45, 0.05, 0.4, 1],    // travelling elements (Tribe star)
  in: [0.4, 0, 1, 1],             // leaving
} as const;

export const spring = {
  soft: { type: "spring", stiffness: 260, damping: 26 },   // cards, layout
  pop: { type: "spring", stiffness: 420, damping: 22 },    // equip item, heart
} as const;
```

Rules:
- Animate only `transform` and `opacity` (and `clip-path` when needed). Never `width`, `top`, `box-shadow` in a loop.
- Stagger lists by 40–60 ms, capped at 8 items.
- Leaving is faster than entering (about 70%).
- `useReducedMotion()`: swap movement for a plain fade or an instant change. Loops stop and show their resting frame.
- Keep motion slow and soft. No bouncy overshoot on serious things like money, locks or errors.

## Signature micro-interactions

| Moment | Interaction |
|---|---|
| **Tribe tab** | A 4-point star in the Tribe gradient races the pill outline anticlockwise from the top-right, leaving a trail that fades towards its tail. The star rests at the top-right and the trail drains into it. Loop is 3.3 s. Existing implementation in `prototype/index.html`; port it to a `TribeSparkle` component |
| **Agent at work** | The same star appears next to anything the agent produced, with one slow pulse when the item first appears |
| **Equip a wardrobe item** | The item pops onto the avatar (`spring.pop`, scale 0.85 → 1), and its meaning label slides up beneath it ("Sunhat · beaches") for 1.2 s |
| **Loadout of 3** | Three slots fill left to right. Picking a fourth gently shakes the slots once and shows the hint "Swap one out" |
| **Reveal together** | Avatars start face-down as cards and flip together. Shared items then float to the centre and merge. The count runs up: "3 of you want to snorkel" |
| **Crew scene** | Overlapping items form a group scene, with each person's signature accessory visible. Slow camera drift, then still |
| **Love / veto** | A love is a heart pop with a brief burst of three particles. A veto is a calm slash across the card and a 50% fade. A veto is never animated with red shakes |
| **Tie-break** | The two cards slide side by side, the least-happy member's avatar lifts, and the winner settles with a one-line reason |
| **Proposal** | It enters with a dashed border and the ripple line types in. Accepted: the border goes solid and the card takes its place (`layout`). Rejected: it folds away |
| **Ripple** | Affected moments nudge to their new times with a layout animation, and the times count to their new values |
| **Fairness strip** | Hearts tick up as moments are added. A zero-heart avatar gets one soft orange ring pulse, not a repeating alarm |
| **Gap slot** | The dashed outline breathes once when a suggestion arrives. Accepting morphs the slot into a moment card |
| **Lock / booked** | The padlock closes, the edit affordances fade out and the card settles (no bounce) |
| **Price changed** | The old price strikes through, the new one slides in and the per-person difference appears. The booking bar dims and is paused |
| **Settle up** | Transfer arrows draw between avatars, then tick as each is settled |
| **Carousel** | A 1.2 s crossfade with a 6.5 s gentle zoom. Captions rise 0.45 s after the image settles. Pauses on hover |

## Screen states: every screen must have them all

Model these as a discriminated union per screen (`idle | loading | ready | empty | error | …`), never as booleans.

### Loading
- **Skeletons** shaped like the real content (avatar circles, moment cards), with a soft shimmer at 1.6 s and `--tint` to white.
- **Agent thinking** shows its steps instead of a spinner, in an `aria-live` region, one line at a time:
  "Checking 6 budgets (privately)… Filtering for veg and step-free stays… Ranking for whoever is least happy…"
  Never reveal names or numbers from private constraints.
- Anything over 4 s shows an extra reassurance line and stays cancellable.

### Empty
Empty states always include a next action and use friendly illustration from the avatar set.

| Screen | Empty state |
|---|---|
| Group, before anyone joins | "Share the link. Friends join in 60 seconds, no login." + Copy link |
| Wardrobe, new user | The avatar standing bare + "Pick 3 things you'd love this trip" |
| Someday wardrobe | "Things you add here come back on future trips" |
| No overlaps | "No shared picks yet. That's fine: everyone gets a moment." |
| Itinerary gaps | Dashed slot: "Free time. Rest, wander, or add a leftover pick" |
| Been-there data | "No verified reviews yet" (no AI guess, ever) |
| Expenses | "Nothing to split yet. Add the first expense" |

### Error (always recoverable)
- Say what happened, what is safe and what to do, in plain words:
  "Couldn't reach the airline. Your picks are saved. Try again"
- Never lose input. Keep form state and the last good result on screen.
- A failed booking shows each item's status (booked / not booked / not charged).
- Network loss in trip mode switches to a calm offline banner. Contacts and safety notes stay available.

### Edge states (from trip-engine)
Nothing fits (binding constraint + levers), deadline passed with non-responders (faded default
avatars), tie, swap over budget (overage + cheaper options), zero-heart member, price changed,
dropout mid-booking, crew or plan change mid-trip. Each gets a designed screen and a transition
into it. None of them is just a toast.

## Feedback patterns

- **Toasts:** bottom on mobile, 4 s, with Undo for reversible actions. Not used for errors that need a decision.
- **Optimistic UI** for loves, vetoes and gap fills: update instantly and roll back with a gentle shake and a message if the request fails.
- **Haptics** (where supported): a light tick on equip, love and lock.
- Buttons get a 0.97 press scale and a disabled state with the reason ("Waiting for 2 friends").

## Performance and quality checks

- 60 fps on a mid-range Android: test with 6× CPU throttle.
- No layout shift when content loads (reserve space for skeletons).
- All animations finish or stop when the component unmounts. No `setInterval` leaks; use `requestAnimationFrame` or Motion.
- Check every state at 390px and 1440px, and again with reduced motion on.
