# Cleartrip Tribe: an AI travel agent for group trips

> **Design assignment for Razorpay.** Concept, research, design and code by **Apoorva B S, National Institute of Design (NID)**.
> This is an independent student prototype. It is **not affiliated with, endorsed by, or built for release by Cleartrip.**

**Live prototype:** [cleartrip-tribe.vercel.app](https://cleartrip-tribe.vercel.app) · best viewed on a phone, or in a narrow browser window

---

## The problem

Planning a trip with friends usually falls on one person: the **Group Coordinator**. They chase people in the group chat, guess everyone's budget, try to keep everyone happy, and end up booking, paying upfront and splitting costs afterwards.

**Tribe** is an AI travel agent inside Cleartrip that takes that load off them. Everyone has a say, nobody's private limits are exposed, and nobody is left out.

## How it works

| Stage | What happens |
|---|---|
| **Setup** | The trip starter sets the dates, the date your tribe's avatars must be ready by, and a budget per person, then shares one link in the group chat. |
| **Avatars** | Each friend builds an avatar: their look (Indian skin tones, hair, gender, extras), 5 trip picks, and one must-have. Friends who haven't finished get a one-tap nudge. |
| **Match** | Everyone sets personal preferences (budget, dates, food, access, passport) that only Tribe AI sees. Tribe AI shortlists 3–5 places, ranked so the least happy person still gets something they love. |
| **Decide** | Anonymous voting: 3 hearts and 1 veto each. A tie goes to the place that leaves nobody out. |
| **Plan** | Tribe AI drafts the itinerary and leaves free slots on purpose. Swaps are proposals the tribe agrees to, and the plan can't be locked until everyone has something they picked. |
| **Book** *(optional)* | Travel, stay and activities, each optional, with a live price check before booking. Or skip and book separately. |
| **Trip** | Today's plan, booking on the go, recalculation when it rains or someone drops out, local contacts, splitting costs, settling up and quick emoji feedback. |

### Principles

- **Private by default.** Budgets and needs are never shown to the group, and nobody is named as the blocker.
- **Needs are never voted on.** Food, access, passport and date needs filter places quietly; only the budget can stretch.
- **Fairness over majority.** Ties and shortlists favour the least happy member.
- **The AI proposes; people decide.** Nothing is booked or changed without the tribe agreeing.

## What's in this repository

```
app/                React + TypeScript prototype (the live link)
  src/domain/       Trip rules as plain TypeScript classes: matching, voting, fairness, splitting
  src/data/         Sample data and mock repositories (no real bookings or payments)
  src/features/     One folder per stage: setup, avatars, match, decide, plan, book, trip
  src/ui/           Shared components, avatar and item art
prototype/          Early static recreation of the Cleartrip landing page
.claude/skills/     The design and engineering rules the build followed
```

## Built with

React 18, TypeScript, Vite, Redux Toolkit, React Router and Motion. Tests use Vitest.

All data is **sample data**: places, prices, reviews, people and contacts are made up for the prototype. **No real bookings or payments** are made.

## Run it locally

You need [Node.js](https://nodejs.org) 18 or newer.

```bash
cd app
npm install
npm run dev
```

Then open the address it prints (for example `http://localhost:5180`). To run the tests: `npm test`.

## Ownership and use

**© 2026 Apoorva B S, National Institute of Design. All rights reserved.**

The concept, research, user flows, interface design, writing, illustrations and code in this repository are the intellectual property of **Apoorva B S**. The work was created as a design assignment for Razorpay and is shared only so it can be reviewed. No licence is granted: please don't copy, reuse or adapt any part of it without written permission. See [LICENSE](LICENSE).

Cleartrip, Air India, KSRTC and other brand names, logos and photographs shown in the prototype belong to their respective owners. They're used only to illustrate a non-commercial concept.

## Contact

**Apoorva B S** · National Institute of Design
