/** Four serpentine rows. Level order is traversal order, not left-to-right reading order. */
export const MOBILE_STATIONS = [
  { x: -.95, row: 3 }, { x: 1.45, row: 3 },
  { x: 1.45, row: 2 }, { x: -1.45, row: 2 },
  { x: -1.45, row: 1 }, { x: 0, row: 1 }, { x: 1.45, row: 1 },
  { x: 1.45, row: 0 }, { x: 0, row: 0 }, { x: -1.45, row: 0 }
] as const;

export function mobileStation(index: number, stride: number) {
  const station = MOBILE_STATIONS[index];
  return { x: station.x, y: .18 + (3 - station.row) * .13, z: (station.row - 1.5) * stride };
}

export function mobileConnection(index: number, stride: number) {
  const a = mobileStation(index, stride), b = mobileStation(index + 1, stride);
  const turn = MOBILE_STATIONS[index].row !== MOBILE_STATIONS[index + 1].row;
  const side = a.x > 0 ? 1 : -1;
  return {
    from: index + 1, to: index + 2,
    points: [a,
      { x: turn ? a.x + side * .95 : a.x + (b.x-a.x)/3, y: a.y+(b.y-a.y)/3, z: turn ? a.z : a.z+(b.z-a.z)/3 },
      { x: turn ? b.x + side * .95 : a.x + (b.x-a.x)*2/3, y: a.y+(b.y-a.y)*2/3, z: turn ? b.z : a.z+(b.z-a.z)*2/3 }, b]
  };
}

/** Accessible fallback follows the same four-row traversal as the real geometry. */
export function mobileFallbackAnchor(index: number) {
  const station = MOBILE_STATIONS[index];
  return { x: 50 + station.x * 17.24, y: 17 + station.row * 23 };
}

export function mobileFallbackPath() {
  const project=(p:{x:number;z:number})=>`${50+p.x*17.24},${17+(p.z+1.5)*23}`;
  return Array.from({length:9},(_,i)=>{const p=mobileConnection(i,1).points;return `${i===0?`M${project(p[0])}`:''} C${project(p[1])} ${project(p[2])} ${project(p[3])}`;}).join('');
}
