---
name: tech-stack
description: How the Cleartrip Tribe app is built — React + TypeScript + Vite, Redux Toolkit, Motion, optional React Three Fiber. Folder structure, layering, OOP domain services, coding standards, testing. Load before creating or editing any source file.
---

# Tech stack and code standards

The app is built like a real product codebase. No single HTML file, no inline scripts or
styles, no logic in components that belongs in the domain layer.

## Stack (pin exact versions in package.json)

| Concern | Choice | Why |
|---|---|---|
| Build | **Vite** + **TypeScript** (strict) | Fast dev server, simple config, production build out of the box |
| UI | **React 18** | Component model fits a multi-screen flow with shared avatars |
| State | **Redux Toolkit** (slices, `createAsyncThunk`, `createEntityAdapter`) | One predictable store for a 6-person group flow with proposals, votes and locks |
| Data fetching / mocks | **RTK Query** + **MSW** (Mock Service Worker) | The UI talks to "an API" from day one; mocks swap for real endpoints with no UI changes |
| Routing | **React Router 6** | One route per flow stage |
| Animation | **Motion** (`motion` package, `import { motion, AnimatePresence } from "motion/react"`) | Declarative, state-driven, enter/exit and layout animations, respects reduced motion |
| 3D (optional) | **React Three Fiber** + **drei** on top of three.js | Only for the crew scene; lazy-loaded so the rest of the app never pays for it |
| Styling | **CSS Modules** + CSS custom properties from `styles/tokens.css` | Exact control to match Cleartrip; no utility-class "AI look" |
| Tests | **Vitest** + **React Testing Library**; **Playwright** for the end-to-end flow | Domain is unit-tested; one happy path and the main loops are E2E-tested |
| Quality | ESLint (typescript-eslint, react-hooks, jsx-a11y), Prettier, `tsc --noEmit` in CI | |

Avatars are **layered SVG in React by default** (2D, crisp, cheap, easy to make inclusive).
Three.js is used only where depth adds meaning (the post-reveal crew scene). Do not reach for
3D to make something look impressive.

## Folder structure

```
app/
  index.html                 # only the mount point
  vite.config.ts
  tsconfig.json
  src/
    main.tsx                 # bootstraps store, router, MSW in dev
    app/
      store.ts               # configureStore, services injected as thunk extraArgument
      hooks.ts               # typed useAppDispatch / useAppSelector
      router.tsx
      services.ts            # composition root: builds and wires domain services
    domain/                  # pure TypeScript. No React, no Redux, no fetch.
      models/                # types and value objects (Money, DateWindow, AvatarItem, Moment…)
      services/              # classes holding business rules (see below)
      rules/                 # small pure functions and constants (caps, thresholds)
    data/
      repositories/          # interfaces + implementations (Mock*, Http*)
      fixtures/              # JSON seed data: places, stays, flights, reviews, avatar items
      msw/                   # request handlers for dev and tests
    features/                # one folder per flow stage
      setup/  avatars/  match/  decide/  plan/  book/  trip/  been-there/
        components/          # screen + feature components (*.tsx + *.module.css)
        hooks/
        slice.ts
        selectors.ts
        thunks.ts
        index.ts             # public API of the feature; others import only from here
    ui/                      # design-system primitives (Button, Pill, Card, Tabs, Chip,
                             # Sheet, Toast, Skeleton, AvatarStack, PricePill, SourceBadge)
    agent/                   # AgentService interface, MockAgent, ProxyAgent, prompt builders
    three/                   # CrewScene and helpers, lazy-loaded
    styles/
      tokens.css  global.css  fonts.css
    test/                    # test utilities, renderWithStore, factories
  e2e/                       # Playwright specs
```

**Import rules** (enforce with eslint `no-restricted-imports`):
- `domain/` imports nothing from the rest of `src/`.
- `features/x` never imports from inside `features/y`; only from `features/y/index.ts`.
- `ui/` never imports from `features/` or Redux.
- Components never call `fetch`; they dispatch thunks or use RTK Query hooks.

## Layering

```
Component (render + events) → hook / selector → thunk → domain service (rules) → repository (data)
```

- **Components** render state and dispatch intent (`proposeSwap`, `castVote`). No business rules.
- **Slices** hold serialisable state only: ids, plain objects, enums. Never class instances,
  Dates (store ISO strings) or functions.
- **Thunks** orchestrate: read state, call domain services, call repositories, dispatch results.
- **Domain services** decide: filtering, ranking, fairness, ripple, splitting. Deterministic,
  unit-tested.
- **Repositories** fetch and persist. The rest of the code depends on the interface, never the
  implementation.

## OOP: where classes earn their place

Use classes for **services with a clear responsibility and swappable implementations**. Use
plain types and pure functions for data and one-line helpers. No inheritance trees deeper than
one level; prefer composition and interfaces.

| Class | Responsibility | Pattern |
|---|---|---|
| `NeedsFilter` | Applies hard constraints (budget ceiling, dates, access, diet, visa). Returns options plus the *binding constraint* when nothing fits | Chain of `Constraint` objects (each implements `Constraint`) |
| `DestinationRanker` | Ranks places by "this trip" loadouts; best for least-happy member first | Strategy (`RankingStrategy`) |
| `OverlapFinder` | Finds shared bucket-list items ("3 of you want to snorkel") | |
| `VoteTally` | One veto each, three loves each; detects ties | |
| `FairnessTieBreaker` | Resolves ties toward the least-happy person | Strategy |
| `FairnessScorer` | Hearts per member across moments; flags members with zero | |
| `ItineraryBuilder` | Builds days → moments, leaves gaps, fills gaps from leftovers | Builder |
| `ProposalEngine` | Turns an edit into a proposal with ripple (₹ delta, time shifts) | Command (`Proposal` has `apply()` / `describe()`) |
| `PriceRevalidator` | Live-checks every item; flags changed prices | |
| `BookingPlanner` | Best value under cap: refundable bias, balanced cost across origins, visible trade-offs | Strategy |
| `ExpenseSplitter` | Who pays whom, minimum transfers | |
| `ReviewRanker` | Repository ranking: own circle → avatar twins → group type → month and budget band → rest, with recency decay | Strategy |
| `AgentService` (interface) | Explanations, summaries, "why this" lines, nudges | Strategy: `MockAgent`, `ProxyAgent` |
| `TripRepository`, `PlaceRepository`, `ReviewRepository`, `InventoryRepository` (interfaces) | Data access | Repository: `Mock*` and `Http*` implementations |

Rules for classes:
- Constructor-inject dependencies (`new BookingPlanner(inventoryRepo, clock)`); no hidden globals.
- Build them once in `app/services.ts` and pass them to thunks via `extraArgument`.
- Methods take plain data and return plain data, so results can go straight into Redux.
- Keep them stateless where possible. Anything stateful lives in Redux.

```ts
// domain/services/NeedsFilter.ts
export interface Constraint {
  readonly id: ConstraintId;              // "budget" | "dates" | "access" | "diet" | "visa"
  allows(option: PlaceOption, group: GroupNeeds): boolean;
}

export class NeedsFilter {
  constructor(private readonly constraints: readonly Constraint[]) {}

  apply(options: PlaceOption[], group: GroupNeeds): FilterResult {
    const passing = options.filter(o => this.constraints.every(c => c.allows(o, group)));
    if (passing.length > 0) return { kind: "ok", options: passing };
    return { kind: "none-fit", bindingConstraint: this.findBinding(options, group) };
  }

  private findBinding(options: PlaceOption[], group: GroupNeeds): ConstraintId {
    // the constraint that, if relaxed alone, lets the most options through
  }
}
```

## The AI layer

- All AI calls go through `AgentService`. Components and slices never know whether it is mock or live.
- `MockAgent` returns deterministic, fixture-backed text with a realistic delay (600–1400 ms)
  so loading states are real. The default for the prototype.
- `ProxyAgent` calls a server endpoint (`/api/agent/*`). **API keys never ship to the browser.**
- Every agent output that states a fact carries `sources: SourceRef[]`. If there are no
  sources, it returns the explicit "no verified reviews yet" variant (see trip-engine).
- Prompt builders live in `agent/prompts/` as typed functions, not string literals in components.

## Coding standards

- TypeScript `strict: true`, `noUncheckedIndexedAccess: true`. No `any`; use `unknown` and narrow.
- Model domain states as discriminated unions (`{ kind: "loading" } | { kind: "ready"; … } | { kind: "error"; … }`), not boolean flags.
- Money is integer paise in a `Money` value object, formatted only in the UI with `en-IN` grouping (₹1,24,500).
- Dates: ISO strings in state, formatted with `Intl.DateTimeFormat("en-IN")` in the UI.
- One component per file; file name = component name. Styles in a sibling `*.module.css`.
- No magic numbers in components or CSS: use tokens (`var(--space-4)`) or named constants.
- Components stay under ~150 lines; split by responsibility when they grow.
- Accessibility: semantic elements, labels on every control, focus visible, keyboard paths for
  vote/veto/swap, `aria-live="polite"` for agent updates.
- No commented-out code, no `console.log` left in, no TODOs without an owner.
- Name things in the product's words: `Moment`, `Loadout`, `Proposal`, `Veto`, not `Item2`, `data`.

## Testing

- Every domain service has unit tests, including edge cases from trip-engine (nothing fits,
  tie, dropout, price change, zero-heart member).
- Components: test behaviour through the UI (`getByRole`), not implementation details.
- Playwright: setup → avatars → reveal → vote → itinerary swap with ripple → booking with a price
  change → split. Seeded fixtures make it deterministic.

## Performance

- Route-level code splitting; `three/` is only loaded on the crew scene route.
- Images: WebP/AVIF, explicit width and height, `loading="lazy"` below the fold.
- Memoised selectors (`createSelector`) for anything derived (rankings, fairness).
- R3F canvas uses `frameloop="demand"`.

## Before saying something is done

1. `npm run typecheck && npm run lint && npm test` pass.
2. The feature works in the browser at mobile width (390×844) and desktop (1440).
3. Loading, empty and error states exist for the screen (see motion-and-states).
