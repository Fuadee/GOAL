'use client';

import { useEffect, useRef } from 'react';
import { formatDuration, formatPace } from '@/lib/running/quest';
import { useRunMotion } from './RunMotionProvider';
import { RUN_MOTION } from './tokens';
import styles from '../running.module.css';

type NumberFormat = 'decimal' | 'pace' | 'duration' | 'level';
function print(value: number, decimals: number, format: NumberFormat) {
  if (format === 'pace') return formatPace(Math.max(1, value)).replace(' /km', '');
  if (format === 'duration') return formatDuration(Math.max(1, Math.round(value)));
  if (format === 'level') return String(Math.round(value)).padStart(2, '0');
  return value.toFixed(decimals);
}

/** DOM-only frames avoid rendering the dashboard 60 times per second. SSR is the final value. */
export function AnimatedNumber({ value, decimals = 0, format = 'decimal', delay = 0 }: { value: number; decimals?: number; format?: NumberFormat; delay?: number }) {
  const { enabled, ready } = useRunMotion();
  const node = useRef<HTMLSpanElement>(null);
  const initialized = useRef(false);
  const previous = useRef(value);
  useEffect(() => {
    if (!ready || !node.current) return;
    const element = node.current;
    const first = !initialized.current;
    initialized.current = true;
    const from = first && enabled ? 0 : previous.current;
    previous.current = value;
    const finalText = print(value, decimals, format);
    if (!enabled || from === value) { if (element.textContent !== finalText) element.textContent = finalText; element.dataset.counting = 'false'; return; }
    element.dataset.counting = 'true';
    const start = performance.now() + (first ? delay : 0);
    let frame = 0;
    const update = (now: number) => {
      const progress = Math.min(Math.max((now - start) / RUN_MOTION.count, 0), 1);
      const next = print(from + (value - from) * (1 - Math.pow(1 - progress, 3)), decimals, format);
      if (element.textContent !== next) element.textContent = next;
      if (progress < 1) frame = requestAnimationFrame(update);
      else element.dataset.counting = 'false';
    };
    frame = requestAnimationFrame(update);
    return () => { cancelAnimationFrame(frame); if (element.textContent !== finalText) element.textContent = finalText; element.dataset.counting = 'false'; };
  }, [value, decimals, format, delay, ready, enabled]);
  return <span className={styles.animatedNumber} data-counter-target={print(value, decimals, format)}>
    <span ref={node} aria-hidden="true">{print(value, decimals, format)}</span>
    <span className={styles.srOnly}>{print(value, decimals, format)}</span>
  </span>;
}

export function AnimatedProgress({ value, label, delay = 0 }: { value: number; label: string; delay?: number }) {
  const { enabled, ready } = useRunMotion();
  const fill = useRef<HTMLElement>(null);
  const previous = useRef(value);
  const initialized = useRef(false);
  useEffect(() => {
    if (!ready || !fill.current) return;
    const first = !initialized.current;
    const from = first && enabled ? 0 : previous.current;
    previous.current = value; initialized.current = true;
    if (!enabled || from === value) return;
    const animation = fill.current.animate([{ transform: `scaleX(${from / 100})` }, { transform: `scaleX(${value / 100})` }], {
      duration: RUN_MOTION.progress, delay: first ? delay : 0, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards'
    });
    return () => animation.cancel();
  }, [value, delay, ready, enabled]);
  return <div className={styles.progressTrack} role="progressbar" aria-label={label} aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
    <i ref={fill} style={{ transform: `scaleX(${value / 100})` }}/>
  </div>;
}
