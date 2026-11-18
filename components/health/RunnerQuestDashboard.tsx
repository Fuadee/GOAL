'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Activity, ArrowDown, Flag, Footprints, Sparkles, Trophy } from 'lucide-react';
import { getRunningGoalProgress } from '@/lib/running/progress';
import { formatDuration, formatPace } from '@/lib/running/quest';
import { ACTIVITY_LABELS, activityType, hasValidMeasurement, levelRequirement } from '@/lib/running/achievements';
import type { RunnerDashboardData, RunnerRunLog } from '@/lib/running/quest.types';
import { RunnerQuestLogForm } from './RunnerQuestLogForm';
import { RunningRoadmap } from './RunningRoadmap';
import { RunAnalytics } from './RunAnalytics';
import { RunHistory } from './RunHistory';
import { RunMotionProvider, useRunMotion } from './motion/RunMotionProvider';
import { AnimatedNumber, AnimatedProgress } from './motion/AnimatedValues';
import { CinematicHero } from './motion/CinematicHero';
import { AchievementFeedback } from './motion/AchievementFeedback';
import { confirmedFeedback, personalRecords, snapshot, type Feedback, type RunSnapshot, type SaveReceipt } from './motion/feedback';
import { RUN_MOTION } from './motion/tokens';
import styles from './running.module.css';
import { Health3DProvider } from './three/Health3DProvider';

function Metric({ label, value, detail, isNew }: { label: string; value: ReactNode; detail: string; isNew: boolean }) {
  return <div className={styles.metric} data-new-pb={isNew}><span>{label}{isNew && <b className={styles.pbBadge}>NEW PB</b>}</span><strong>{value}</strong><small>{detail}</small></div>;
}

export function RunnerQuestDashboard(props: { data: RunnerDashboardData; goalImageUrl: string | null }) {
  return <RunMotionProvider><Health3DProvider><DashboardContent {...props}/></Health3DProvider></RunMotionProvider>;
}

function DashboardContent({ data, goalImageUrl }: { data: RunnerDashboardData; goalImageUrl: string | null }) {
  const { enabled, reduced, toggle } = useRunMotion();
  const [editing, setEditing] = useState<RunnerRunLog | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [pendingFeedback, setPendingFeedback] = useState<{ before: RunSnapshot; receipt: SaveReceipt; key: number } | null>(null);
  const beforeSave = useRef<RunSnapshot | null>(null);
  const sequence = useRef(0);
  const formSection = useRef<HTMLDivElement>(null);
  const focusFrame = useRef(0);
  useEffect(() => () => cancelAnimationFrame(focusFrame.current), []);
  useEffect(() => {
    if (!pendingFeedback) return;
    const confirmed = confirmedFeedback(pendingFeedback.before, data, pendingFeedback.receipt, pendingFeedback.key);
    if (confirmed) { setFeedback(confirmed); setPendingFeedback(null); }
  }, [data, pendingFeedback]);
  useEffect(() => {
    if (!pendingFeedback) return;
    // A delayed/failed refresh never becomes a guessed success or stale future award.
    const timeout = setTimeout(() => setPendingFeedback(null), 15000);
    return () => clearTimeout(timeout);
  }, [pendingFeedback]);
  useEffect(() => {
    if (!feedback) return;
    const timeout = setTimeout(() => setFeedback(null), RUN_MOTION.feedbackLifetime);
    return () => clearTimeout(timeout);
  }, [feedback]);
  const clearFeedback = () => { setFeedback(null); setPendingFeedback(null); };
  const { bestDistanceKm, progress } = getRunningGoalProgress(data);
  const latest = data.logs[0] ?? null;
  const current = data.currentLevel;
  const measured = data.logs.filter(log => hasValidMeasurement(log) && activityType(log) !== 'walk');
  const best = personalRecords(data.logs);
  const newRecord = (label: string) => feedback?.records.includes(label) ?? false;
  return <>
    <div className={styles.toolbar}>
      <span className={styles.eyebrow}><Activity size={15} aria-hidden="true"/> HEALTH / RUNNING ACHIEVEMENTS</span>
      <button className={styles.effectsButton} type="button" aria-pressed={enabled} title="เปิด/ปิด 3D และเอฟเฟกต์ตกแต่ง" disabled={reduced} onClick={toggle}><Sparkles size={14} aria-hidden="true"/>{reduced ? 'ลดการเคลื่อนไหว' : `เอฟเฟกต์ ${enabled ? 'เปิด' : 'ปิด'}`}</button>
    </div>
    <CinematicHero goalImageUrl={goalImageUrl}/>
    <section className={styles.progressPanel} aria-label="ความก้าวหน้าสองรูปแบบ" data-motion-region="progress" data-entered="true">
      <div className={styles.progressBlock}>
        <div className={styles.progressHeading}><span>LEVEL PROGRESS</span><strong><AnimatedNumber value={data.completionPercent} delay={800}/><small>%</small></strong></div>
        <AnimatedProgress value={data.completionPercent} label="Level Progress" delay={850}/>
        <p>ผ่านแล้ว <b>{data.passedLevelsCount} / 10 ระดับ</b> · ตามลำดับ L1 → L10</p>
      </div>
      <div className={styles.progressBlock}>
        <div className={styles.progressHeading}><span>DISTANCE PROGRESS</span><strong><AnimatedNumber value={progress} decimals={1} delay={950}/><small>%</small></strong></div>
        <AnimatedProgress value={progress} label="Distance Progress" delay={1000}/>
        <p>ระยะสูงสุด <b>{bestDistanceKm.toFixed(2)} / 5.00 กม.</b> · ไม่ใช่ผลผ่าน Level</p>
      </div>
      <div className={styles.currentBlock} data-new-current={!!feedback?.levels.length}>
        <span className={styles.eyebrow}>YOUR NEXT ACHIEVEMENT</span>
        <strong>{current ? <>LEVEL <AnimatedNumber value={current.level_number} format="level" delay={1100}/></> : '5K ACHIEVED'}<Flag size={24} aria-hidden="true"/></strong>
        <p key={current?.id ?? 'complete'} className={styles.currentRequirement}>{current ? levelRequirement(current) : 'ผ่านครบทั้ง 10 ระดับแล้ว บันทึกผลวิ่งต่อได้เสมอ'}</p>
      </div>
    </section>
    <div className={styles.mainGrid}>
      <div className={styles.leftColumn}>
        <RunningRoadmap data={data} unlocked={feedback?.levels}/>
        <RunAnalytics logs={measured}/>
      </div>
      <aside className={styles.rightColumn}>
        <div ref={formSection}>
          <RunnerQuestLogForm key={editing?.id ?? 'new'} currentLevel={current} editing={editing}
            writesEnabled={editing ? data.writesEnabled : data.canCreateRun} storageReady={data.storageReady}
            onCancel={() => setEditing(null)}
            onSaveStart={() => { clearFeedback(); beforeSave.current = snapshot(data); }}
            onSaved={receipt => {
              if (beforeSave.current) setPendingFeedback({ before: beforeSave.current, receipt, key: ++sequence.current });
              setEditing(null);
            }}/>
        </div>
        <section className={`${styles.panel} ${styles.recordsPanel}`} data-motion-region="records" data-new-pb={!!feedback?.records.length}>
          <div className={styles.sectionHead}><div><p className={styles.eyebrow}>YOUR RECORDS</p><h2>Personal Best</h2></div><span className={styles.trophyMedallion}><Trophy size={25} aria-hidden="true"/></span></div>
          <p className={styles.muted}>สถิติสูงสุดตลอดประวัติ ไม่ใช่สมรรถนะปัจจุบัน</p>
          <div className={styles.bestGrid}>
            <Metric label="ระยะทางสูงสุด" value={best.distance ? <><AnimatedNumber value={best.distance.distance_km} decimals={2}/> <small>km</small></> : '—'} detail={best.distance?.run_date ?? 'ยังไม่มีข้อมูล'} isNew={newRecord('ระยะทางสูงสุด')}/>
            <Metric label="Pace ดีที่สุด · ทุกระยะ" value={best.pace ? <AnimatedNumber value={best.pace.pace_seconds_per_km} format="pace"/> : '—'} detail={best.pace ? `${best.pace.run_date} · ${best.pace.distance_km.toFixed(2)} km` : 'ยังไม่มีเวลารวมจริง'} isNew={newRecord('Pace ดีที่สุด')}/>
            <Metric label="วิ่งต่อเนื่องไกลที่สุด" value={data.longestNoStopDistance ? <><AnimatedNumber value={data.longestNoStopDistance} decimals={2}/> <small>km</small></> : '—'} detail="เฉพาะข้อมูลที่ยืนยันวิ่งต่อเนื่อง" isNew={newRecord('วิ่งต่อเนื่องไกลที่สุด')}/>
            <Metric label="เวลา 5K ดีที่สุด" value={best.five ? <AnimatedNumber value={best.five.duration_seconds} format="duration"/> : '—'} detail={best.five ? best.five.run_date : 'เฉพาะครั้งที่วิ่งต่อเนื่อง 5.00 กม.'} isNew={newRecord('เวลา 5K ดีที่สุด')}/>
          </div>
        </section>
        <section className={`${styles.panel} ${styles.latest}`} data-motion-region="latest">
          <div className={styles.sectionHead}><div><p className={styles.eyebrow}>LATEST ACTIVITY</p><h2>การวิ่งครั้งล่าสุด</h2></div><Footprints size={23} aria-hidden="true"/></div>
          {latest ? <><p className={styles.muted}>{latest.run_date} · {ACTIVITY_LABELS[activityType(latest)]}</p><strong>{latest.distance_km.toFixed(2)} <small>KM</small></strong><p>{formatDuration(latest.duration_seconds)} <span> / </span> {formatPace(latest.pace_seconds_per_km)}</p><a href="#running-history">ดูประวัติทั้งหมด <ArrowDown size={15} aria-hidden="true"/></a></> : <p className={styles.empty}>ยังไม่มีการวิ่งที่บันทึกไว้<br/>เริ่มบันทึกครั้งแรกเพื่อดูความก้าวหน้า</p>}
        </section>
      </aside>
    </div>
    <RunHistory logs={data.logs} writesEnabled={!!data.writesEnabled} freshId={feedback?.runId} onDeleteStart={clearFeedback} onEdit={log => {
      clearFeedback(); setEditing(log);
      cancelAnimationFrame(focusFrame.current);
      focusFrame.current = requestAnimationFrame(() => {
        formSection.current?.scrollIntoView({ behavior: enabled ? 'smooth' : 'instant', block: 'start' });
        formSection.current?.querySelector<HTMLInputElement>('input[type="date"]')?.focus({ preventScroll: true });
      });
    }}/>
    <AchievementFeedback feedback={feedback} onDismiss={() => setFeedback(null)}/>
    <footer className={styles.footer}><span>GOAL / ROAD TO 5K</span><span>YOUR EFFORT. YOUR EVIDENCE. YOUR PROGRESS.</span></footer>
  </>;
}
