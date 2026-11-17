export const SHOE_AUTO_SPEED = Math.PI * 2 / 10;
/** Pure angular state; no React updates or frame-rate-dependent increments. */
export class ShoeRotation {
  angle = -.35;
  velocity = SHOE_AUTO_SPEED;
  dragging = false;
  private released = 10;
  begin() { this.dragging = true; this.velocity = 0; }
  drag(deltaX: number, width: number, seconds: number) {
    if (!this.dragging) return;
    const delta = deltaX / Math.max(width, 1) * Math.PI * 2;
    this.angle += delta;
    this.velocity = Math.max(-4, Math.min(4, delta / Math.max(seconds, .008)));
  }
  end() { this.dragging = false; this.released = 0; }
  nudge(delta: number) { this.angle += delta; this.velocity = 0; this.dragging = false; this.released = 0; }
  step(seconds: number) {
    if (this.dragging) return;
    this.released += seconds;
    if (this.released < .65) this.velocity *= Math.exp(-4 * seconds);
    else this.velocity += (SHOE_AUTO_SPEED - this.velocity) * (1 - Math.exp(-4 * seconds));
    this.angle += this.velocity * seconds;
  }
}
