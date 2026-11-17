/** Shared motion rhythm, in milliseconds. Decoration never controls application state. */
export const RUN_MOTION = {
  quick: 180,
  reveal: 680,
  count: 820,
  progress: 950,
  feedbackLifetime: 8000,
  easing: [0.22, 1, 0.36, 1] as const,
  hero: { ambient: 0, runner: 150, title: 300, sweep: 550, finish: 700, progress: 800 }
};
