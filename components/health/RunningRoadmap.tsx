'use client';

import { Activity, Check, ChevronRight, LockKeyhole } from 'lucide-react';
import { useState } from 'react';
import { formatPace, formatDuration } from '@/lib/running/quest';
import { levelRequirement, unmetReason } from '@/lib/running/achievements';
import type { RunnerDashboardData } from '@/lib/running/quest.types';
import styles from './running.module.css';
import { LevelTrackScene } from './three/LevelTrackScene';
import trackStyles from './three/three.module.css';

export function RunningRoadmap({ data, unlocked = [] }: { data: RunnerDashboardData; unlocked?: number[] }) {
  const [selected, setSelected] = useState<number>();
  const focused=selected ?? data.levels.find(level=>level.progress?.status==='available')?.level_number ?? 10;
  return <section className={`${styles.panel} ${styles.roadmapPanel}`} aria-labelledby="roadmap-heading" data-motion-region="roadmap">
    <div className={styles.sectionHead}><div><p className={styles.eyebrow}>THE JOURNEY</p><h2 id="roadmap-heading">เส้นทางสู่เป้าหมาย 5K</h2></div><span className={styles.pill}>{data.passedLevelsCount} / 10 DONE</span></div>
    <div className={trackStyles.levelSelector} role="group" aria-label="เลือกระดับ 1 ถึง 10">{data.levels.map(level => <button type="button" key={level.id} data-level-selector={level.level_number} data-state={level.progress?.status} aria-pressed={focused===level.level_number} aria-label={`เลือก Level ${level.level_number}`} onClick={()=>setSelected(level.level_number)}>{level.progress?.status === 'passed' ? <><Check size={15} aria-hidden="true"/><span className={trackStyles.selectorNumber}>{level.level_number}</span></> : level.level_number}</button>)}</div>
    <LevelTrackScene data={data} selected={selected} onSelected={setSelected}/>
    <div className={styles.levelList}>{data.levels.map(level => {
      const status = level.progress?.status;
      const justUnlocked = unlocked.includes(level.level_number);
      return <div key={level.id}>
        {[1, 6, 8].includes(level.level_number) && <p className={styles.phase}><span>{level.level_number === 1 ? '01 / BUILD DISTANCE' : level.level_number === 6 ? '02 / REACH & RUN 5K' : '03 / OWN YOUR PACE'}</span><i aria-hidden="true"/></p>}
        <details id={`running-level-${level.level_number}`} className={styles.level} data-state={status} data-level={level.level_number} data-just-unlocked={justUnlocked}>
          <span className={styles.levelAura} aria-hidden="true"/>
          {status === 'available' && <span className={styles.borderBeam} aria-hidden="true"/>}
          <summary>
            <span className={styles.levelNumber}>{status === 'passed' ? <Check className={styles.checkmark} size={20} aria-hidden="true"/> : String(level.level_number).padStart(2, '0')}</span>
            <span className={styles.levelText}><strong>Level {level.level_number}<span>{level.distance_target_km.toFixed(1)} <small>KM</small></span></strong><small>{level.level_number === 6 ? 'วิ่งสลับเดินได้' : 'วิ่งต่อเนื่อง'} · {level.pace_target_seconds_per_km ? `≤ ${formatPace(level.pace_target_seconds_per_km)}` : 'ไม่จำกัด Pace'}</small></span>
            <span className={styles.state}>{status === 'passed' ? <><Check size={11} aria-hidden="true"/> Done</> : status === 'available' ? <><i className={styles.currentDot} aria-hidden="true"/> Current</> : <><LockKeyhole size={12} aria-hidden="true"/> Locked</>}</span>
            <ChevronRight className={styles.chevron} size={16} aria-hidden="true"/>
          </summary>
          <div className={styles.levelDetail}>
            <p>{levelRequirement(level)}</p>
            {level.evidence ? <p className={styles.success}>{status === 'locked' ? 'ทำเงื่อนไขนี้ได้แล้ว / รอ Level ก่อนหน้า' : 'หลักฐานที่ผ่าน'} · {level.evidence.run_date} · {level.evidence.distance_km.toFixed(2)} กม. · {formatDuration(level.evidence.duration_seconds)}</p> : <p>เทียบกับครั้งล่าสุด: {unmetReason(level, data.logs[0] ?? null)}</p>}
          </div>
        </details>
        {status === 'locked' && level.conditionMet && <p className={styles.waiting}>✓ ทำเงื่อนไขนี้ได้แล้ว / รอ Level ก่อนหน้า</p>}
      </div>;
    })}</div>
    <div className={styles.ruleNote}><Activity size={17} aria-hidden="true"/><p>L8–L10 ใช้ Pace เฉลี่ยจากเวลารวม ÷ ระยะจริงทั้งครั้ง แม้วิ่งเกิน 5 กม. ไม่สร้างเวลา split 5K ขึ้นเอง<br/>การเดินล้วนไม่ผ่าน Level · ข้อมูลเก่าที่ไม่ยืนยันรูปแบบจะแสดง “ไม่ทราบ”</p></div>
  </section>;
}
