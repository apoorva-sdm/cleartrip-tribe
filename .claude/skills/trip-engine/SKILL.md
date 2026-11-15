---
name: trip-engine
description: The product logic of Cleartrip Tribe, the group-trip AI agent — the 7-stage flow (Setup, Avatars, Match, Decide, Plan, Book, Trip), every loop, the fairness and inclusion rules, the avatar wardrobe, the itinerary board, the Been-there repository, and what the AI may and may not do. Load before building any screen, slice or domain service.
---

# Trip engine: flow, rules and AI behaviour

**Persona:** the Group Coordinator (the initiator) and the friends they are trying to get
moving (the followers). Usually 4–8 people in a WhatsApp group, on phones.

**The product promise:** the agent does the chasing, filtering and booking; the group makes the
calls; nobody is overridden, and the quietest member is protected.

## Who acts (use these as the `actor` on every event)

| Actor | Meaning | UI signal |
|---|---|---|
| `initiator` | Sets the frame (window, deadline, budget cap). Not preferences | Initiator badge, dashboard |
| `everyone` | Every member, the initiator included, with **equal weight** | Avatar stack |
| `agent` | The AI does the work | Tribe gradient sparkle badge |
| `decision` | A system check or a locked state | Neutral grey |
| `repository` | Cleartrip's verified traveller data feeds the step | `SourceBadge` ("Been there · 14 verified") |

## The flow as a state machine

Implement as an explicit `TripStage` enum with guarded transitions in `domain/`. Each stage
maps to a route and a feature folder.

```
SETUP → AVATARS → MATCH → DECIDE → PLAN → BOOK → TRIP
```

### 1. Setup
- **Start a trip** (initiator): date window, response deadline, per-person budget cap. That is
  all; the initiator does not enter preferences here.
- **Make share link** (agent): one link, **no login** for followers. Opens straight into avatars.

### 2. Avatars
- **Build avatars** (everyone): items plus **one lock** (the single thing this person won't give up).
- **Loop: All in or deadline?** No → **Nudge in chat** (agent): a friendly reminder, never a
  shame list. Back to Build avatars.
- At the deadline, non-responders get **neutral defaults**, not exclusion. Show them as a faded
  avatar with "joined with defaults; can change anytime".
- **Reveal together** (agent): everyone's avatars appear at once. Show **overlaps, no names**
  ("3 of you want to snorkel").

#### The avatar wardrobe (declared, not inferred)
- Every item is an explicit bucket-list object with a visible label. Tapping it says what it means.

| Item | Means |
|---|---|
| Sunhat | Beaches and coasts |
| Hiking boots | Trails |
| Camera | Culture and photography |
| Apron | Food experiences |
| Headphones | Music and nightlife |
| Yoga mat | Wellness |
| Snorkel mask | Water sports |
| Backdrop slot | Climate and scenery |

- About **8 slots**, curated items, built in **under 60 seconds**.
- Two layers: a persistent **Someday wardrobe** (grows over time) and a **This-trip loadout of 3**
  top picks. **Only the loadout drives ranking.**
- **Gift moments**: if one person's dream fits the trip, the group can make it happen. Opt-in, so
  private dreams never leak.
- Inclusive by default: body types, skin tones, mobility aids, religious attire.
- More avatar components will come from the user's reference images. Fit them into this model.

### 3. Match
- **Private constraints** (everyone): budget, dates, needs. Private by default.
- **Needs filter first** (agent): access, diet (veg, Jain, halal), visa, budget ceiling and dates
  are **hard filters, never voted on**. They shrink the option set silently.
- **Loop: Anything fits?** No → **Name the limit** (agent): name the binding constraint and
  offer levers, **never name the person** ("Most options go over ₹18,000. Stretch to ₹20,000 or
  move dates by a week?") → **Adjust and retry** → back to Private constraints.
- **Shortlist three** (agent): ranked **best for the least-happy member**, not by average.
  Each option shows who it fits and why.
- The repository feeds the shortlist with **Been-there notes**: verified verdicts and skips.

### 4. Decide
- **Group votes** (everyone): each person has **one veto and three loves**. Been-there notes sit
  on the same card, and conflicting reviews sit side by side, not averaged.
- **Loop: Tie?** Yes → **Fairness tie-break** (agent): the option that suits the least-happy
  person wins. Say so plainly.
- **Place locked** (decision): dates settled too.

### 5. Plan
- **Build itinerary** (agent): three options, open gaps left on purpose.
- The repository feeds **Why-this sources**: cited reviews and tips.
- **Group reviews** (everyone): **swaps are proposals, not changes.**
- **Loop: Everyone ok?** No → **Show the ripple** (agent): cost and time impact
  ("saves ₹1,200, moves lunch 30 min") → **Re-propose** → back to Group reviews.
- **Fairness check** (agent): each avatar must have at least one moment.
  Gap → **Fill the gaps** (everyone): leftover bucket-list items and local tips
  ("Snorkelling, 2 hrs, needs 3 people. Add it?").
- **Plan frozen** (decision): ready for booking.

#### The itinerary board (not a corporate journey map)
- Two levels only: **Days → Moments**. Never "phases, stages, steps".
- Mobile-first and vertical, swipeable days. The wide board is the desktop view.
- Each moment card: one icon, short title, time, price pill, the "who it's for" row (avatar items
  and needs it serves), a sticker for who added it, a source badge, and a lock once booked.
- Dashed **gap slot** between moments, pre-filled with suggestions. Gaps also stay as rest time.
- **Fairness strip** at the top: each avatar with a heart count. Zero hearts →
  "Kabir has no moment yet. Add one?"
- **Spotlight**: tap an avatar to highlight the moments that serve that person.
- **Pinned/locked** moments can't be edited by accident.
- **Activity as a story**: "Kabir swapped jet-ski for cooking class", not a change log.
- Main risk: six people editing at once. Proposals and the locked state are core, not polish.

### 6. Book
- **Revalidate prices** (agent): live check on every item.
- **Loop: Price changed?** Yes → **Reconfirm together** (everyone): show the difference per
  person, pause booking until agreed.
- **Traveller details** (everyone): each person adds their own.
- **Book cheapest options within group preferences** (agent). "Cheapest" means **best value
  under the cap**:
  - refundable by default when the price difference is small;
  - the cost burden is balanced across origin cities, not just the group average;
  - a visible trade-off whenever the cheapest is passed over ("₹400 more for a 9 am departure").

### 7. Trip
- **Live trip mode** (everyone): votes, replans, expenses.
- **Loop: If it shifts** → **Plan or crew changes** (agent): recompute and reconfirm, then
  re-enter group review.
- **Contacts and safety** (repository): booked items, local contact cards, safety notes,
  **available offline**.
- **Split expenses** (agent): who pays whom, minimum transfers.
- **Settle up** (everyone): Google Pay or any UPI app (hand off; the app never holds money).
- **Avatars learn** (agent): **three taps per moment**: loved it, skipped it, would not repeat.
  One action feeds both the avatar and the repository → **Repository grows**.

## Initiator vs follower: two experiences

| | Initiator | Follower |
|---|---|---|
| Wants | Progress without chasing, cover for hard calls | Low effort and a safe voice |
| Gets | Dashboard, deadline, auto-nudges, the agent as co-initiator | No-login link, 60-second avatar, a veto, protected preferences |
| Risk | Burnout; their avatar weighing more | Silence, late dropout, agreeing to what they can't afford |

- Followers can step up in small doses: own one day or one meal.
- An anonymous **"too pricey"** signal triggers cheaper swaps without naming anyone.
- Opt-in activities with a **minimum headcount**, so uneven budgets don't force one plan.

## The Been-there repository

Cleartrip's booking data is the trust asset: "Stayed here in March, booked through Cleartrip".

**Ranking order (`ReviewRanker`):**
1. Your own circle's past reviews (if they booked through Cleartrip).
2. **Avatar twins**: reviewers whose avatars overlap with yours.
3. Similar group types (six friends, family with elders).
4. Same month and budget band.
5. Everything else, collapsed by default.

Plus: needs-matched reviews surface for groups with the same needs (a wheelchair user, a Jain
traveller). Reviews older than ~18 months fade in ranking. Conflicts stay visible.

**Where it plugs in** (it adds a source badge, never a step): Shortlist three, Group votes,
Fill the gaps, Build itinerary ("why this" line), Live trip (contacts, safety), Avatars learn.

**Local contacts:** shown only after the place is locked **and** the item is booked. Price range,
languages, their own preferred channel; contact happens outside the app. No paid placement;
ratings only from completed trips; contacts opt in and control what's shown.

**Trust rules:** structured fields over free text; any entry can be flagged and held for human
review.

## What the AI may and may not do

| The agent may | The agent may not |
|---|---|
| Filter, rank, shortlist, draft itineraries, find gaps | Decide for the group. Every change is a proposal |
| Nudge non-responders kindly | Name who is blocking, who is broke, or who vetoed |
| Explain every pick with cited sources | State a fact with no source. If there's no data: "No verified reviews yet" |
| Revalidate prices and pause on changes | Book or pay without the group's confirmation |
| Summarise reviews that exist | Invent reviews, ratings, contacts or prices |
| Suggest a tie-break and say why | Let a majority vote away an access or diet need |

**Explanation pattern** for every agent pick: *what* + *why (who it serves)* + *source*.
"Chosen because it fits 3 bucket lists and stays under the cap · 14 verified stays".

## Edge cases that must have screens

- Nothing fits (name the limit, offer levers).
- Non-responders at deadline (neutral defaults).
- Tie in voting (fairness tie-break).
- A swap breaks the budget (show the overage, offer cheaper alternatives, don't fail).
- A member has zero moments (fairness nudge).
- Price changed during booking (reconfirm).
- Someone drops out mid-booking (recompute per-person cost, re-vote if needed).
- Plan or crew changes mid-trip (recompute, reconfirm).
- Offline during the trip (contacts and safety still available).
- No repository data for a place ("No verified reviews yet", never a guess).

## Copy voice

- Short, warm, specific, Indian context (₹, en-IN dates, real Indian and nearby destinations).
- Talk to the group as "you all" / "3 of you", never single someone out.
- The agent speaks in the first person sparingly and never claims feelings.
