'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useId, type CSSProperties } from 'react';
import styles from './life-dashboard.module.css';

export function ProgressRing({ percentage, precision = 0, hero = false }: { percentage: number | null; precision?: number; hero?: boolean }) {
  const reducedMotion = useReducedMotion();
  const gradientId = useId();
  const bounded = Math.min(Math.max(percentage ?? 0, 0), 100);
  return (
    <div className={`${styles.ring} ${hero ? styles.orb : ''}`} role="img" aria-label={percentage === null ? 'ยังไม่มีข้อมูลความคืบหน้า' : `${hero ? 'ความสำเร็จโดยรวม' : 'ความคืบหน้า'} ${percentage.toFixed(precision)}%`}>
      {hero && <><div className={styles.orbit} /><div className={styles.orbSurface} /></>}
      <svg viewBox="0 0 120 120" aria-hidden="true">
        <defs><linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#8bbafa" /><stop offset="0.55" stopColor="#2563eb" /><stop offset="1" stopColor="#153b87" /></linearGradient></defs>
        <circle cx="60" cy="60" r="51" fill="none" stroke="#e6eef8" strokeWidth={hero ? 7 : 5} />
        {percentage !== null && <motion.circle
          cx="60" cy="60" r="51" fill="none" stroke={`url(#${gradientId})`} strokeWidth={hero ? 7 : 5}
          strokeLinecap="round" pathLength="100" strokeDasharray="100" transform="rotate(-90 60 60)"
          initial={reducedMotion ? false : { strokeDashoffset: 100 }} animate={{ strokeDashoffset: 100 - bounded }}
          transition={{ duration: reducedMotion ? 0 : 1, ease: 'easeOut' }}
          className={styles.progressArc}
          style={{ opacity: bounded === 0 ? 0 : 1, '--ring-offset': 100 - bounded } as CSSProperties}
        />}
      </svg>
      <div className={styles.ringLabel} aria-hidden="true">
        <span className={styles.ringValue}>{percentage === null ? '—' : percentage.toFixed(precision)}{percentage !== null && <span className={styles.percent}>%</span>}</span>
        {hero && <span className={styles.orbCaption}>{percentage === null ? 'รอข้อมูลความคืบหน้า' : 'ความสำเร็จโดยรวม'}</span>}
      </div>
    </div>
  );
}
