'use client';

import { Check, Trophy, X } from 'lucide-react';
import { AnimatePresence, m } from 'framer-motion';
import type { CSSProperties } from 'react';
import { useRunMotion } from './RunMotionProvider';
import type { Feedback } from './feedback';
import styles from '../running.module.css';
import { UnlockMedalScene } from '../three/UnlockMedalScene';

export function AchievementFeedback({ feedback, onDismiss }: { feedback: Feedback | null; onDismiss: () => void }) {
  const { enabled } = useRunMotion();
  const celebration = feedback?.kind === 'achievement' || feedback?.kind === 'record';
  return <div className={styles.feedbackDock}>
    <AnimatePresence initial={false}>
      {feedback && <m.aside key={feedback.key} className={styles.feedback} data-feedback={feedback.kind} data-celebration={celebration ? 'true' : 'false'}
        initial={enabled ? { opacity: 0, y: 24, scale: 0.97 } : false} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: enabled ? 12 : 0 }} transition={{ duration: enabled ? 0.35 : 0 }}>
        {enabled && celebration && <div className={styles.particles} aria-hidden="true">{Array.from({length: 9}, (_, index) => <i key={index} style={{ '--angle': `${index * 40}deg`, '--particle-delay': `${index % 3 * 45}ms` } as CSSProperties}/>)}</div>}
        {feedback.kind === 'achievement' && <UnlockMedalScene levels={feedback.levels}/>}
        <span className={styles.feedbackIcon} aria-hidden="true">{celebration ? <Trophy size={25}/> : <Check size={24}/>}</span>
        <div role="status" aria-live="polite" aria-atomic="true">
          <p className={styles.eyebrow}>{feedback.kind === 'achievement' ? 'NEXT LEVEL. NEW YOU.' : feedback.kind === 'record' ? 'A NEW PERSONAL BEST' : 'PROGRESS SAVED'}</p>
          <h3>{feedback.kind === 'achievement' ? `ปลดล็อก ${feedback.levels.length} ระดับใหม่!` : feedback.kind === 'record' ? 'สถิติใหม่ของคุณ' : feedback.kind === 'updated' ? 'อัปเดตผลการวิ่งแล้ว' : 'บันทึกผลวิ่งแล้ว'}</h3>
          {feedback.levels.length > 0 && <p className={styles.unlockedList}>{feedback.levels.map(level => <span key={level}>L{level}</span>)}</p>}
          <p>{feedback.records.length ? `Personal Best · ${feedback.records.join(' / ')}` : feedback.kind === 'updated' ? 'ประเมินความก้าวหน้าจากข้อมูลล่าสุดแล้ว' : 'ทุกก้าวที่บันทึก คือหลักฐานของความพยายาม'}</p>
        </div>
        <button type="button" onClick={onDismiss} aria-label="ปิดข้อความผลการบันทึก"><X size={18}/></button>
      </m.aside>}
    </AnimatePresence>
  </div>;
}
