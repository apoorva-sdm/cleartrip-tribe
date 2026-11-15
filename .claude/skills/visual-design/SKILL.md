---
name: visual-design
description: The visual language for Cleartrip Tribe — match today's Cleartrip exactly (tokens measured from cleartrip.com), with the Tribe pink-orange gradient as the only new signature. Colours, type, spacing, radii, shadows, component specs, layout, and anti-generic rules. Load before styling anything.
---

# Visual design: look like Cleartrip, today

The goal is that a Cleartrip designer could not tell this was not shipped by their team.
Tribe is a new feature **inside** Cleartrip, not a new brand. Calm white surfaces, black ink,
one orange action, thin grey lines. Personality comes from the **avatars and photos**, not
from the chrome.

Reference build: `prototype/index.html` (the landing page recreated from live measurements).
When in doubt, measure the live site and match it.

## Tokens (`src/styles/tokens.css`)

```css
:root {
  /* Ink and surfaces */
  --ink: #1a1a1a;            /* all primary text, primary outline buttons, selected radio */
  --ink-2: #666666;          /* secondary text */
  --ink-3: #808080;          /* tertiary text, checkbox border */
  --muted: #999999;          /* placeholders, unselected radio */
  --line: #e6e6e6;           /* card and field borders, dividers */
  --line-2: #e0e0e0;         /* chip borders */
  --surface: #ffffff;
  --tint: #f7faff;           /* product-tabs band, soft section backgrounds */
  --pill: #ecf3ff;           /* soft blue pills (Track flights) */
  --avatar-bg: #dce5fc;      /* light blue behind avatars and illustrations */

  /* Brand and meaning */
  --orange: #ff4f17;         /* THE primary action. One per screen. Also "save" tags */
  --green: #11a670;          /* savings, refundable, "fits", positive deltas */
  --link: #3366cc;           /* text links, "View all" */
  --red: #e8212b;            /* errors, over-budget, destructive */

  /* Tribe signature (from the Elite pill). Agent and Tribe only */
  --tribe-grad: linear-gradient(90deg, #ee5fc9 0%, #f7a1b8 55%, #fbbf9a 100%);
  --tribe-grad-strong: linear-gradient(90deg, #e0309f, #ff5a36);
  --elite-grad: linear-gradient(90deg, #ff3d6e, #ff7a45);

  /* Type */
  --font: "Inter", system-ui, sans-serif;

  /* Radii */
  --r-xs: 3px;   /* checkbox */
  --r-sm: 4px;   /* tags */
  --r-md: 6px;   /* fields, chips */
  --r-btn: 8px;  /* buttons, promo cards */
  --r-card: 12px;/* cards, banners */
  --r-pill: 40px;/* product tabs, pills */

  /* Shadows */
  --sh-card: 0 8px 16px rgba(0, 0, 0, 0.04);
  --sh-float: 0 6px 20px 2px rgba(0, 0, 0, 0.12);  /* popovers, sheets, floating bars */

  /* Spacing (4px base) */
  --space-1: 4px; --space-2: 8px; --space-3: 12px; --space-4: 16px;
  --space-5: 20px; --space-6: 24px; --space-8: 32px; --space-10: 40px;
}
```

## Typography: Inter only

| Role | Size / line | Weight | Use |
|---|---|---|---|
| Display | 30 / 36, −0.2 tracking | 600 | Page H1 ("Search flights") |
| Subtitle | 18 / 22 | 500 | Under H1, section titles ("More offers") |
| Title | 16 / 20–24 | 600 | Card titles, moment titles |
| Body L | 16 / 24 | 500 | Fields, tabs, radios |
| Body | 14 / 20 | 500 | Nav, list text, buttons (600) |
| Small | 12 / 16 | 500–600 | Meta, pills |
| Micro | 10 / 14–16 | 500–600 | Savings in green, tags |

- Font smoothing antialiased. No other typefaces. No all-caps headings.
- Prices: weight 600, tabular numbers (`font-variant-numeric: tabular-nums`), `en-IN` grouping.

## Layout

- **Desktop:** header 64px, content 1440px wide, 28px side padding. Product-tabs band 80px on
  `--tint`. Two columns: main ~857px, side rail 307px, 32px gap.
- **Mobile (primary for Tribe flows):** 390px design width, 16px gutters, sticky bottom action
  bar with the single orange button, bottom sheets instead of modals.
- Cards: white, 1px `--line`, `--r-card`, `--sh-card`, padding 32/40/40 desktop, 16 mobile.
- Generous white space; separate with 1px lines and spacing, not with colour blocks.

## Components (match these specs)

| Component | Spec |
|---|---|
| Primary button | `--orange`, white 14/600 text, radius 8, height 56 (desktop search) / 48 (mobile). One per screen |
| Secondary button | White, 1px `--ink` border, ink 14/600 text, radius 8, height 40 |
| Dark compact button | `--ink` fill, white 600 text, radius 8, height 32 |
| Product tab | Height 48, radius 40, padding 8/16/8/8, 32px round icon, 16/500 text. Selected: white fill, 1px `--line`, 600 |
| Tribe tab / agent badge | Same as tab, 1.5px border in `--tribe-grad`, black label, animated star (motion-and-states) |
| Field | Height 52, 1px `--line`, radius 6, 16/500 text, icon gap 16 |
| Chip | 1px `--line-2`, radius 6, padding 8, 12/500 title + 10 green sub |
| Radio | 20px circle; off: 1.5px `--muted`; on: 6px `--ink` ring |
| Toggle | 32×18 track, `#b3b3b3` off, 14px white knob |
| Soft pill | `--pill` fill, 1px `rgba(26,26,26,.1)`, radius 24, 12/600 |
| Save tag | `--orange` fill, white 10/600, radius 4 |
| Banner | Radius 12, gradient fill, white text, white inner card with `--sh-float` |
| Promo card | Radius 8, full-bleed photo, left dark gradient, white 16/700 headline |
| Carousel dots | 6px dots, active widens to 12px |
| Links | `--link`, 14/600, no underline |

## New Tribe components (style rules)

The chrome stays Cleartrip; these add the group layer.

- **Avatar:** circular crop on `--avatar-bg`. Stacks overlap by 25% with a 2px white ring.
- **Wardrobe item:** white tile, 1px `--line`, radius 12, item illustration plus a 12/600
  **label that says what it means** ("Sunhat · beaches"). Selected: 1.5px `--ink` border and a
  check, not a colour fill.
- **Moment card:** card spec, icon left, title 16/600, time 12/500 `--ink-2`, price pill right,
  "who it's for" row of tiny avatar items, a source badge.
- **Gap slot:** 1.5px dashed `--line`, radius 12, `--tint` fill, suggestion in `--ink-2`.
- **Proposal card:** like a moment card with a 1.5px dashed `--ink` border and a ripple line
  ("−₹1,200 · lunch +30 min") in green or red.
- **Fairness strip:** a row of avatars with heart counts; a zero shows a soft orange dot, never red.
- **Source badge:** 10/600 text, `--pill` fill, radius 4: "Been there · 14 verified".
- **Agent marker:** a small 4-point star in `--tribe-grad-strong`. The only place the gradient is
  used besides the Tribe tab and the Elite pill.
- **Lock:** a small ink padlock with "Booked" in 12/600; locked cards drop the edit affordances.
- **Avatar reference images:** the user will share them while building. Match their style exactly,
  then place them in this chrome. Don't redraw them in a different style.

## Photography and illustration

- Real travel photos in promos and place cards (the user's own images in `prototype/img/`), with
  a left-to-right dark gradient for text.
- Illustrations only for avatars and wardrobe items, in the style of the user's references.
- Icons: thin 1.5px line icons in `--ink`, 20–24px, like Cleartrip's. No emoji as icons.

## Anti-generic rules (this must not look AI-made)

- No purple/indigo gradients, no glassmorphism blobs, no neon glows, no dark-mode-by-default.
- No gradients except the Tribe/Elite ones and photo overlays.
- No rounded-2xl-everything: use the radius scale above.
- No centred hero with a giant headline and two buttons. Product screens lead with the task.
- No "✨ AI-powered" labels. The agent shows itself through its work and the small star marker.
- No lorem ipsum, no "John Doe". Use Indian names (Meera, Kabir, Ananya, Rohan, Zoya, Arjun),
  real destinations (Gokarna, Rishikesh, Coorg, Pondicherry, Krabi, Bali), ₹ prices.
- No more than one orange element competing for attention per view.
- Every number and claim on screen looks real and is consistent across screens.

## Accessibility

- Text contrast ≥ 4.5:1 (ink on white is fine; never white text on the light gradient end).
- Touch targets ≥ 44×44 on mobile.
- Visible focus: 2px `--ink` outline, 2px offset.
- Never rely on colour alone: over-budget gets an icon and text, not just red.
