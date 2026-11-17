/** Shared bounded goal ratio; callers retain their existing display precision. */
export function goalPercentage(completed: number, target: number) {
  return target > 0 ? Math.min(Math.max((completed / target) * 100, 0), 100) : 0;
}
