/** Motion tokens. See .claude/skills/motion-and-states. */
export const duration = {
  tap: 0.12,
  quick: 0.2,
  base: 0.32,
  reveal: 0.6,
  slow: 1.2,
} as const;

export const ease = {
  out: [0.2, 0.8, 0.2, 1],
  inOut: [0.45, 0.05, 0.4, 1],
  in: [0.4, 0, 1, 1],
} as const;

export const spring = {
  soft: { type: "spring", stiffness: 260, damping: 26 },
  pop: { type: "spring", stiffness: 420, damping: 22 },
} as const;
