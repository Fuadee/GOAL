import type { GrowthAssetRow, GrowthAssetType } from './types';

export const assetLabels: Record<GrowthAssetType, string> = {
  investment: 'การลงทุน',
  safe: 'เงินสำรอง',
  future: 'เงินอนาคต',
  receivable: 'เงินรอรับ',
};

export function assetValue(row: Pick<GrowthAssetRow, 'current_value'>) {
  return Number(row.current_value);
}

type Point = { id: string; value: number; minDiameter?: number };
type Circle = Point & { x: number; y: number; r: number };

export function packAssets(points: Point[], width: number) {
  const sorted = points
    .filter((p) => p.value > 0)
    .sort((a, b) => b.value - a.value || a.id.localeCompare(b.id));
  const circles: Circle[] = [];
  if (!sorted.length || width < 1) return { circles, height: 0 };
  const gap = width < 500 ? 7 : 12;
  const maxRadius = Math.min(width * 0.42, 162);
  for (const point of sorted) {
    const r = maxRadius * Math.sqrt(point.value / sorted[0].value);
    if (2 * r < (point.minDiameter ?? 0)) continue;
    let best = { x: width / 2, y: 0, score: Infinity };
    // At each horizontal position, settle the circle against the visible skyline.
    const steps = Math.ceil((width - 2 * r) / 5);
    for (let i = 0; i <= steps; i++) {
      const x = r + ((width - 2 * r) * i) / Math.max(steps, 1);
      let above = 0,
        below = 0;
      for (const c of circles) {
        const reach = r + c.r + gap;
        const dx = x - c.x;
        if (Math.abs(dx) >= reach) continue;
        const dy = Math.sqrt(reach * reach - dx * dx);
        above = Math.min(above, c.y - dy);
        below = Math.max(below, c.y + dy);
      }
      const y = Math.abs(above) < below ? above : below;
      const score = Math.hypot((x - width / 2) * 0.48, y);
      if (score < best.score) best = { x, y, score };
    }
    circles.push({ ...point, r, x: best.x, y: best.y });
  }
  if (!circles.length) return { circles, height: 0 };
  const top = circles.reduce((v, c) => Math.min(v, c.y - c.r), Infinity);
  const bottom = circles.reduce((v, c) => Math.max(v, c.y + c.r), -Infinity);
  const left = circles.reduce((v, c) => Math.min(v, c.x - c.r), width);
  const right = circles.reduce((v, c) => Math.max(v, c.x + c.r), 0);
  for (const c of circles) {
    c.x += (width - left - right) / 2;
    c.y -= top;
  }
  return { circles, height: bottom - top };
}
