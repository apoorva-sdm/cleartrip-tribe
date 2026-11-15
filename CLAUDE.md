# Cleartrip Tribe — Guardrails

Razorpay Design (NID) assignment: an AI travel agent for Cleartrip's **Group Coordinator**
persona. These rules apply to every session in this folder and override convenience.

## Who you're working with
- I'm a designer, not a developer. Explain in plain words and give exact steps when I need to do something.
- Keep sessions quick and compact. Short updates, no long recaps.

## Before and after every change
1. **Before** changing anything substantial (new screen, new dependency, restructuring), tell me
   the plan in 2–4 lines and wait for my "go ahead". Small fixes I asked for directly: just do them.
2. **After** each change, tell me: what changed, which files, and where to look (URL and screen).
3. Verify in the browser at 390px and 1440px before saying it works. If you couldn't check
   something, say so.

## Skills: load before working
| Working on | Load |
|---|---|
| Any source file, folder, dependency | `tech-stack` |
| Any screen, flow step, rule or AI behaviour | `trip-engine` |
| Any styling or new component | `visual-design` |
| Any animation or screen state | `motion-and-states` |

If a request conflicts with a skill, point it out and ask. Don't silently pick one.

## Hard limits (never, even if asked casually)
- **Never publish, deploy or push** anything without listing exactly what goes live and getting an
  explicit "yes" for that push. The Cleartrip recreation stays local or behind a private link;
  it must never look like the real Cleartrip site on a public URL.
- **Never put API keys, tokens or passwords in the frontend** or in any committed file. Live AI
  calls go through a server proxy; keys live in `.env.local` (git-ignored).
- **No real payments or bookings.** Payments, UPI and booking flows are simulated. No real card,
  UPI ID or bank detail anywhere, even as sample data.
- **Don't delete or rename** existing files, screens, components or images unless I ask.
  `prototype/` is the reference build. Don't change it while building the app.
- **Don't run destructive commands** (`rm -rf`, `git reset --hard`, force push) without asking.

## Honesty in the work
- **Never invent research.** Interview quotes, findings and numbers come only from my notes.
  If something is missing, leave a clear `[TODO: from interview]`, not a plausible guess.
- **Don't fill in my judgement.** In `AI_LOG.md`, the Decision and Why fields are mine. You may add
  new entries describing what was asked and what was produced, and leave those fields blank.
- Sample data (places, prices, reviews) must be clearly fixture data in `data/fixtures/`,
  realistic and internally consistent, never presented as real Cleartrip data.
- The in-app agent follows trip-engine's "may / may not" table: no unsourced claims, nobody
  named as the blocker, no booking without group confirmation.

## Privacy
- Interviewees are anonymised: first-name pseudonyms only, no phone numbers, screenshots blurred.
- My personal details never go into code, commits, fixtures or requests to outside services.
- Group members' private constraints (budget, needs) are never shown to other members in the UI.

## Design integrity
- Match the avatar reference images I send **exactly**. Don't restyle, "improve" or substitute them.
- Match Cleartrip's current look (visual-design). Don't drift into a generic AI style.
- Use only images I've provided or properly licensed ones. Don't copy Cleartrip's own campaign art or copy text.
- Accessibility isn't optional: labels, contrast, focus, reduced motion.

## Git
- Work on a feature branch (`feat/<short-name>`), never directly on `main`.
- Small commits with clear messages. Commit only when I ask; never push without my explicit yes.
- `.gitignore` covers `node_modules`, `dist`, `.env*`, interview recordings and raw notes.

## When unsure
Ask one short question with your recommended answer first. Don't stall on things with an
obvious default: pick it, say so, and carry on.

## Definition of done
- Typecheck, lint and tests pass.
- Works at 390px and 1440px, with loading, empty and error states.
- Reduced motion checked.
- No keys, no real personal data, no unsourced claims.
- I've been told what changed and where to look.
