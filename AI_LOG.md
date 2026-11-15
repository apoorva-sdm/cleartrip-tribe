# AI Log — Razorpay AI Travel Agent

Brief received: ____ (deadline = +3–4 days)

> Rule: log **every** meaningful AI use as it happens, not afterwards.
> One entry = one decision. If you didn't keep, change or reject anything, it's not worth logging.

---

## ⭐ Deck picks (fill at the end)

The brief asks for exactly these two — pick your strongest entries.

| Required example | Entry # | One-line story |
|---|---|---|
| AI improved my **discovery** | | |
| AI improved my **solution** | | |

---

## Entries

**Decision key:** ✅ Kept · ✏️ Changed · ❌ Rejected

### #1 — Breaking down the brief
- **Date / phase:** 2026-11-15 · Research
- **Tool:** Claude Code
- **What I asked:** Read the brief like a senior consultant; turn it into actionables and a step-by-step roadmap.
- **What it gave:** A table of what the brief is really grading, a checklist of deliverables, a recommended setup (Group Coordinator, Cleartrip, mobile, coded prototype with fake AI replies) and a 4-day, 12-hour roadmap.
- **Decision:** ✅ / ✏️ / ❌
- **Why (my judgement):**
- **Evidence:** _(screenshot / link)_
- **Deck-worthy?** ☐

### #2 — Persona choice
- **Date / phase:** 2026-11-15 · Research
- **Tool:** Claude Code
- **What I asked:** Which persona to solve for.
- **What it gave:** Recommended Group Coordinator (most room for AI, least obvious, easy to find people to interview). Fallback: Weekend Escaper.
- **Decision:** ✅ / ✏️ / ❌
- **Why (my judgement):**
- **Evidence:**
- **Deck-worthy?** ☐

### #3 — Interview discussion guide
- **Date / phase:** 2026-11-15 · Research
- **Tool:** Claude Code
- **What I asked:** A short interview guide focused on group coordination, how each member behaves, and how roles get assigned.
- **What it gave:** A 20-minute guide in 6 parts (see INTERVIEW_GUIDE.md), including a card of 7 member types to show *after* people describe their group in their own words.
- **Decision:** ✅ / ✏️ / ❌
- **Why (my judgement):** _(After interview 1: which questions worked, which fell flat, what did you add?)_
- **Evidence:** INTERVIEW_GUIDE.md
- **Deck-worthy?** ☐

---

### #4 — Skill files for the build
- **Date / phase:** 2026-11-15 · Prototyping setup
- **Tool:** Claude Code
- **What I asked:** Turn my flowchart and concept notes into 4 skill files (tech stack, product logic, Cleartrip visual style, motion and states), and recommend a framework.
- **What it gave:** `.claude/skills/` → tech-stack, trip-engine, visual-design, motion-and-states. Recommended React + TypeScript + Vite, Redux Toolkit, Motion, and React Three Fiber for the crew scene only. Swapped the earlier "three.js" skill for a "trip-engine" skill, because the flow logic matters more than 3D.
- **Decision:** ✅ / ✏️ / ❌
- **Why (my judgement):**
- **Evidence:** .claude/skills/
- **Deck-worthy?** ☐

### #5 — Guardrail file
- **Date / phase:** 2026-11-15 · Prototyping setup
- **Tool:** Claude Code
- **What I asked:** A guardrail file to keep the AI honest and safe during the build.
- **What it gave:** `CLAUDE.md` covering: plan-before-change, no publishing without an explicit yes, no keys in the frontend, simulated payments only, never invent research, the Decision/Why fields stay mine, anonymised interviewees, match avatar references exactly, and a definition of done.
- **Decision:** ✅ / ✏️ / ❌
- **Why (my judgement):**
- **Evidence:** CLAUDE.md
- **Deck-worthy?** ☐ _(good for a "how I set rules for AI" slide)_

### #6 — First build: Setup + Avatars
- **Date / phase:** 2026-11-15 · Prototyping
- **Tool:** Claude Code (plus one helper agent working in parallel on the landing page)
- **What I asked:** Set up the project and build the flowchart steps in order, following the Cleartrip visual system, on localhost only.
- **What it gave:** A React app (`app/`) with the landing page ported and the Tribe tab linked. Setup: Start a trip, Make share link. Avatars: Build avatar (3 picks + 1 lock), All in or deadline?, Nudge in chat, Reveal together (overlaps with no names). Placeholder avatars until I send my references.
- **Decision:** ✅ / ✏️ / ❌
- **Why (my judgement):**
- **Evidence:** http://localhost:5180
- **Deck-worthy?** ☐

### #7 — Match stage
- **Date / phase:** 2026-11-15 · Prototyping
- **Tool:** Claude Code
- **What I asked:** Continue to Match, following the flowchart.
- **What it gave:** Private constraints (budget, days, food, step-free, passport) → needs filter → Anything fits? → Shortlist three, ranked for the least-happy member, with Been-there notes; or Name the limit (no names) → Adjust and retry. Places, prices, reviews and friends' constraints are labelled sample data.
- **Decision:** ✅ / ✏️ / ❌
- **Why (my judgement):**
- **Evidence:** http://localhost:5180/tribe/constraints
- **Deck-worthy?** ☐

### #8 — Decide → Plan → Book → Trip
- **Date / phase:** 2026-11-15 · Prototyping
- **Tool:** Claude Code
- **What I asked:** Build the rest of the flowchart end to end without asking, so I can review it all and then give changes.
- **What it gave:** Group votes (3 loves, 1 veto) with fairness tie-break and Place locked; itinerary board with swaps as proposals (ripple, objections, re-propose), fairness strip and gap filling, Plan frozen; price revalidation with Reconfirm together, traveller details, best-value booking with reasons; live trip with mid-trip changes, contacts and safety, split expenses, settle up, and three-tap feedback that grows Been-there and the Someday wardrobe. All sample data is labelled.
- **Decision:** ✅ / ✏️ / ❌
- **Why (my judgement):**
- **Evidence:** http://localhost:5180 (full run)
- **Deck-worthy?** ☐

### #9 — Review round 1: 13 changes
- **Date / phase:** 2026-11-15 · Prototyping
- **Tool:** Claude Code
- **What I asked:** After my end-to-end review, 13 changes: shorter, playful copy; "thinking / pondering / visualising / calculating" for the agent; richer Indian avatars (skin tones, hair, genders) with more items, pick 5 and lock 1; named friends still building with a nudge each; shared picks as tiles with vote counts; simpler private settings; more places and at least 3 to vote on; optional Book steps (travel with ticket details and return accordion, stay with swap, activities with costs); optional traveller details; a "how did you book?" question before the trip; booking on the spot and dropout repricing during the trip. Plus an explanation of the dates and private-settings logic.
- **What it gave:** All 13 built and checked in one full run. 13 sample places (was 7) and 14 trip items (was 7). Places over budget are added, clearly tagged, only when fewer than 3 fit.
- **Decision:** ✅ / ✏️ / ❌
- **Why (my judgement):**
- **Evidence:** http://localhost:5180 (full run)
- **Deck-worthy?** ☐

### #10 — Review round 2: copy, avatars, booking visuals
- **Date / phase:** 2026-11-15 · Prototyping
- **Tool:** Claude Code
- **What I asked:** Conversational copy without emojis in headings ("Your tribe's avatars must be ready by", "Your personal preferences"); orange primary and black secondary buttons; pictures for travel and stays, with a details link and the swap button outside the card; picked items shown on the avatar and a better avatar design; emoji faces for feedback; no fairness line; a plane progress bar from avatars to itinerary. Earlier the same session: My Tribe page, "crew" → "tribe", 3D-style avatars from a reference image.
- **What it gave:** All of the above, built in code. Avatars and pictures are drawn as SVG in a 3D clay style (not rendered 3D or photos), so every option combination works without image licensing.
- **Decision:** ✅ / ✏️ / ❌
- **Why (my judgement):**
- **Evidence:** http://localhost:5180
- **Deck-worthy?** ☐

---

### #__ — _(copy this block)_
- **Date / phase:**
- **Tool:**
- **What I asked:**
- **What it gave:**
- **Decision:** ✅ / ✏️ / ❌
- **Why (my judgement):**
- **Evidence:**
- **Deck-worthy?** ☐

---

## 🔁 Patterns I noticed about the AI
_(Where it was reliably good, where it kept going generic or wrong. This makes a strong "how I work with AI" slide.)_

-

## 🛑 What I'd do next
_(Fill before submitting.)_

-
