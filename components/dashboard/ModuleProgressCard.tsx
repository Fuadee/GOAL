'use client';

import Link from 'next/link';
import { ArrowUpRight, HeartPulse, Lightbulb, Sprout, Target, Wallet } from 'lucide-react';
import { useReducedMotion } from 'framer-motion';
import type { PointerEvent } from 'react';
import type { ModuleProgress } from '@/lib/dashboard/progress';
import { ProgressRing } from './ProgressRing';
import styles from './life-dashboard.module.css';

const icons = { smv: Target, money: Wallet, health: HeartPulse, innovation: Lightbulb, world: Sprout };
const number = new Intl.NumberFormat('th-TH', { maximumFractionDigits: 1 });

export function ModuleProgressCard({ module }: { module: ModuleProgress }) {
  const reducedMotion = useReducedMotion();
  const Icon = icons[module.id];
  function tilt(event: PointerEvent<HTMLAnchorElement>) {
    if (reducedMotion || event.pointerType !== 'mouse' || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty('--tilt-x', `${-(event.clientY - rect.top - rect.height / 2) / rect.height * 5}deg`);
    event.currentTarget.style.setProperty('--tilt-y', `${(event.clientX - rect.left - rect.width / 2) / rect.width * 5}deg`);
  }
  function reset(event: PointerEvent<HTMLAnchorElement>) {
    event.currentTarget.style.setProperty('--tilt-x', '0deg');
    event.currentTarget.style.setProperty('--tilt-y', '0deg');
  }
  return (
    <Link href={module.href} prefetch={false} className={styles.moduleCard} onPointerMove={tilt} onPointerLeave={reset} onPointerCancel={reset}>
      <div className={styles.cardHeader}><span className={styles.moduleIcon}><Icon size={21} strokeWidth={1.6} aria-hidden="true" /></span><ArrowUpRight className={styles.cardArrow} size={18} aria-hidden="true" /></div>
      <div className={styles.cardMain}>
        <div className={styles.cardText}><h3>{module.title}</h3><p>{module.metric}</p></div>
        <ProgressRing percentage={module.percentage} precision={module.precision} />
      </div>
      <div className={styles.cardDetail}>
        {module.percentage === null ? <p className={styles.noData}>{module.unavailable ? 'ข้อมูลไม่พร้อมใช้งาน' : 'ยังไม่มีข้อมูลความคืบหน้า'}</p> : module.completed !== undefined && module.total !== undefined ? <p className={styles.count}>{number.format(module.completed)} <span>/ {number.format(module.total)} {module.unit}</span></p> : null}
        <p>{module.detail}</p>
      </div>
      {module.nextAction && <p className={styles.nextAction}><span>ถัดไป</span> {module.nextAction.title}</p>}
    </Link>
  );
}
