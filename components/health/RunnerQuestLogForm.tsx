'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowUpRight, Check, LoaderCircle, Timer, X } from 'lucide-react';
import { createRunnerRunLogAction } from '@/app/health/actions';
import { formatDuration, formatPace, parseMinuteSecondDuration } from '@/lib/running/quest';
import { ACTIVITY_LABELS, activityType, bangkokToday, RUNNING_LEVELS, qualifiesForLevel, unmetReason } from '@/lib/running/achievements';
import type { RunnerActivityType, RunnerDashboardLevel, RunnerRunLog } from '@/lib/running/quest.types';
import styles from './running.module.css';
import type { SaveReceipt } from './motion/feedback';

export function RunnerQuestLogForm({ currentLevel, editing, onCancel, onSaveStart, onSaved, writesEnabled = false }: {
  currentLevel: RunnerDashboardLevel | null; editing?: RunnerRunLog | null; onCancel?: () => void; onSaveStart?: () => void; onSaved?: (receipt: SaveReceipt) => void; writesEnabled?: boolean;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const submitLock = useRef(false);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [distance, setDistance] = useState(editing ? String(editing.distance_km) : '');
  const [duration, setDuration] = useState(editing ? formatDuration(editing.duration_seconds) : '');
  const [activity, setActivity] = useState<RunnerActivityType | ''>(editing ? activityType(editing) : '');
  const parsed = parseMinuteSecondDuration(duration);
  const preview = Number(distance) > 0 && parsed.durationSeconds ? {
    distance_km: Number(distance), duration_seconds: parsed.durationSeconds, no_stop: activity === 'continuous', activity_type: activity || 'unknown'
  } as RunnerRunLog : null;
  const qualifying = preview ? RUNNING_LEVELS.filter(level => qualifiesForLevel(level, preview)) : [];

  return <section className={`${styles.panel} ${styles.logPanel}`} id="run-log" aria-labelledby="log-heading" data-motion-region="form">
    <div className={styles.sectionHead}><div><p className={styles.eyebrow}>MAKE IT COUNT</p><h2 id="log-heading">{editing ? 'แก้ไขผลการวิ่ง' : 'บันทึกผลการวิ่ง'}</h2></div><Timer size={23} aria-hidden="true" /></div>
    <p className={styles.muted}>ทุกก้าวมีความหมาย บันทึกจากผลที่วิ่งจริง</p>
    <form ref={formRef} className={styles.form} aria-busy={pending} onChange={() => { if (message) setMessage(''); }} action={form => {
      if (submitLock.current || !writesEnabled) return;
      submitLock.current = true;
      setError(''); setMessage('');
      onSaveStart?.();
      const receipt: SaveReceipt = { kind: editing ? 'edit' : 'create', id: editing?.id, expected: {
        run_date: String(form.get('run_date')), distance_km: Number(form.get('distance_km')),
        duration_seconds: parsed.durationSeconds ?? 0, activity_type: activity || 'unknown'
      } };
      startTransition(async () => {
        try {
          const result = await createRunnerRunLogAction(form);
          if (!result.success) { setError(result.message); return; }
          setMessage(result.message);
          if (!editing) { formRef.current?.reset(); setDistance(''); setDuration(''); setActivity(''); }
          onSaved?.(receipt); router.refresh();
        } catch { setError('เชื่อมต่อไม่สำเร็จ ข้อมูลที่กรอกยังอยู่ กรุณาลองอีกครั้ง'); }
        finally { submitLock.current = false; }
      });
    }}>
      {editing && <><input type="hidden" name="id" value={editing.id}/><input type="hidden" name="updated_at" value={editing.updated_at ?? ''}/></>}
      <fieldset disabled={pending} className={styles.fields}>
        <div className={styles.fieldGrid}>
          <label>วันที่<input type="date" name="run_date" required min="1900-01-01" max={bangkokToday()} defaultValue={editing?.run_date ?? bangkokToday()}/></label>
          <label>ระยะทาง (กม.)<input type="number" name="distance_km" required min="0.01" max="1000" step="any" inputMode="decimal" placeholder="0.00" value={distance} onChange={event => setDistance(event.target.value)}/></label>
          <label className={styles.fullField}>เวลารวม<input name="duration_input" required placeholder="mm:ss หรือ hh:mm:ss" value={duration} onChange={event => setDuration(event.target.value)} aria-describedby="time-help" aria-invalid={!!duration && !!parsed.error}/><small id="time-help">รวมช่วงเดินและหยุดพัก • รูปแบบเดิม 1725 = 17:25</small>{duration && parsed.error && <small className={styles.error}>{parsed.error}</small>}</label>
        </div>
        <label>รูปแบบกิจกรรม<select name="activity_type" value={activity} required onChange={event => setActivity(event.target.value as RunnerActivityType)}><option value="" disabled>เลือกรูปแบบที่ทำจริง</option>{Object.entries(ACTIVITY_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <div className={styles.pacePreview} aria-live="polite"><span>PACE เฉลี่ยอัตโนมัติ</span><strong key={preview ? formatPace(preview.duration_seconds / preview.distance_km) : 'empty'} className={styles.paceResult}>{preview ? formatPace(preview.duration_seconds / preview.distance_km) : '— /km'}</strong><small>{preview ? qualifying.length ? `เข้าเกณฑ์ ${qualifying.map(level => `L${level.level_number}`).join(', ')} · ปลดล็อกตามลำดับ` : currentLevel ? unmetReason(currentLevel, preview) : 'ยังไม่เข้าเกณฑ์ระดับใด' : 'คำนวณจากระยะทางและเวลารวม'}</small></div>
        <details className={styles.details} open={!!editing?.note}><summary>หมายเหตุและความหนัก</summary><label>หมายเหตุ<textarea name="note" rows={3} maxLength={2000} defaultValue={editing?.note ?? ''} placeholder="ความรู้สึก สภาพอากาศ หรือรายละเอียดการวิ่ง"/></label><label>ความหนัก<select name="effort" defaultValue={editing?.effort ?? ''}><option value="">ไม่ระบุ</option><option value="easy">เบา</option><option value="normal">ปกติ</option><option value="hard">หนัก</option></select></label></details>
      </fieldset>
      {error && <p role="alert" className={styles.error}>{error}</p>}
      {message && <p role="status" className={styles.success}>{message}</p>}
      <button type="submit" className={styles.primaryButton} data-save-state={pending ? 'pending' : message ? 'success' : 'idle'} disabled={pending || !writesEnabled}>
        {pending ? <LoaderCircle className={styles.spinner} size={20} aria-hidden="true"/> : message ? <Check size={20} aria-hidden="true"/> : null}
        <span>{pending ? 'กำลังบันทึก…' : message ? 'บันทึกสำเร็จ' : editing ? 'บันทึกการแก้ไข' : 'บันทึกผลวิ่ง'}</span>
        {!pending && !message && <ArrowUpRight size={20} aria-hidden="true"/>}
      </button>
      {!writesEnabled && <p className={styles.muted}>โหมดอ่านอย่างเดียว · ยังไม่เปิดรับการเปลี่ยนแปลงข้อมูล</p>}
      {editing && <button className={styles.secondaryButton} type="button" onClick={onCancel} disabled={pending}><X size={16} aria-hidden="true"/>ยกเลิกการแก้ไข</button>}
    </form>
  </section>;
}
