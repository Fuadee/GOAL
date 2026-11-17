/** Presentation only: achievement status always comes from the dashboard data. */
export function staircasePoint(index: number, compact: boolean) {
  return { x: (index - 4.5) * (compact ? .29 : 1.18), y: .24 + index * (compact ? .53 : .32), z: 0 };
}

export function fallbackAnchor(index: number) {
  return { x: 12 + index * 8.3, y: 86 - index * 7.7 };
}
