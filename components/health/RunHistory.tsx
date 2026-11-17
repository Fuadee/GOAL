'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, m } from 'framer-motion';
import { ArrowDown, Pencil, Trash2 } from 'lucide-react';
import { deleteRunnerRunLogAction } from '@/app/health/actions';
import { formatDuration, formatPace } from '@/lib/running/quest';
import { ACTIVITY_LABELS, activityType, RUNNING_LEVELS, qualifiesForLevel } from '@/lib/running/achievements';
import type { RunnerRunLog } from '@/lib/running/quest.types';
import { useRunMotion } from './motion/RunMotionProvider';
import styles from './running.module.css';

export function RunHistory({ logs, writesEnabled, freshId, onEdit, onDeleteStart }: { logs: RunnerRunLog[]; writesEnabled: boolean; freshId?: string; onEdit: (log: RunnerRunLog) => void; onDeleteStart: () => void }) {
  const router = useRouter();
  const { enabled } = useRunMotion();
  const [visible, setVisible] = useState(10);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const busy = useRef(false);
  const [message, setMessage] = useState('');
  return <section className={`${styles.panel} ${styles.historyPanel}`} id="running-history" aria-labelledby="history-heading" data-motion-region="history">
    <div className={styles.sectionHead}><div><p className={styles.eyebrow}>EVERY RUN TELLS A STORY</p><h2 id="history-heading">Running History</h2></div><span className={styles.pill}>{logs.length} RECORDS</span></div>
    <p className={styles.muted}>ผลตามเกณฑ์ใหม่คำนวณจากแต่ละครั้ง · การปลดล็อกหลักเป็นไปตามลำดับ Level</p>
    {!logs.length ? <p className={styles.empty}>ยังไม่มีประวัติ · บันทึกผลจริงครั้งแรกที่แบบฟอร์มด้านบน</p> : <div className={styles.historyList}><AnimatePresence initial={false} mode="popLayout">{logs.slice(0, visible).map(log => {
      const qualified = RUNNING_LEVELS.filter(level => qualifiesForLevel(level, log));
      return <m.article className={styles.historyRow} key={log.id} data-run-id={log.id} data-fresh={freshId === log.id} layout={enabled ? 'position' : false}
        initial={enabled ? { opacity: 0, y: 12 } : false} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: enabled ? .97 : 1 }} transition={{ duration: enabled ? .28 : 0 }}>
        <div className={styles.historyDate}><span>{log.run_date}</span><small>{ACTIVITY_LABELS[activityType(log)]}</small></div>
        <div className={styles.historyMeasurement}><strong>{log.distance_km.toFixed(2)}<small> km</small></strong><span>{formatDuration(log.duration_seconds)}</span><span>{formatPace(log.pace_seconds_per_km)}</span></div>
        <div className={styles.historyResult}><span>{qualified.length ? `เข้าเกณฑ์ ${qualified.map(level => `L${level.level_number}`).join(', ')}` : 'ยังไม่เข้าเกณฑ์ระดับใด'}</span>{log.duration_source === 'legacy_pace' && <small>เวลาโดยประมาณจาก Pace เดิม · ไม่นับเกณฑ์เวลา</small>}{log.note && <p>{log.note}</p>}</div>
        <div className={styles.rowActions}><button type="button" aria-label={`แก้ไข ${log.run_date} ${log.distance_km} กม.`} disabled={!writesEnabled || pending} onClick={() => onEdit(log)}><Pencil size={16} aria-hidden="true"/></button><button type="button" aria-label={`ลบ ${log.run_date} ${log.distance_km} กม.`} disabled={!writesEnabled || pending} onClick={() => setDeleting(log.id)}><Trash2 size={16} aria-hidden="true"/></button></div>
        {deleting === log.id && <div className={styles.deleteConfirm} role="group" aria-label="ยืนยันลบรายการ"><p>นำการวิ่งวันที่ {log.run_date} ออกจากประวัติ? ระดับอาจลดลงตามหลักฐานที่เหลือ โดยยังเก็บสำเนาข้อมูลไว้</p>
          <button type="button" className={styles.dangerButton} disabled={pending} onClick={() => {
            if (busy.current || !writesEnabled) return;
            busy.current = true; onDeleteStart();
            startTransition(async () => {
              try { const result = await deleteRunnerRunLogAction(log.id, log.updated_at ?? ''); setMessage(result.message); if (result.success) { setDeleting(null); router.refresh(); } }
              catch { setMessage('ลบไม่สำเร็จ กรุณาลองอีกครั้ง'); }
              finally { busy.current = false; }
            });
          }}>{pending ? 'กำลังลบ…' : 'ยืนยันลบ'}</button>
          <button type="button" className={styles.secondaryButton} disabled={pending} onClick={() => setDeleting(null)}>ยกเลิก</button>
        </div>}
      </m.article>;
    })}</AnimatePresence></div>}
    {message && <p role="status" className={styles.muted}>{message}</p>}
    {logs.length > visible && <button type="button" className={styles.secondaryButton} onClick={() => setVisible(value => value + 20)}>ดูเพิ่มอีก {Math.min(20, logs.length - visible)} รายการ <ArrowDown size={15} aria-hidden="true"/></button>}
  </section>;
}
