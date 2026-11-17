'use client';

import { useEffect, useRef, useState } from 'react';
import { Activity } from 'lucide-react';
import { formatDuration, formatPace } from '@/lib/running/quest';
import { ACTIVITY_LABELS, activityType } from '@/lib/running/achievements';
import type { RunnerRunLog } from '@/lib/running/quest.types';
import { useRunMotion } from './motion/RunMotionProvider';
import styles from './running.module.css';

export function RunAnalytics({ logs }: { logs: RunnerRunLog[] }) {
  const { enabled } = useRunMotion();
  const [metric, setMetric] = useState<'distance' | 'pace'>('distance');
  const [selected, setSelected] = useState<string | null>(null);
  const line = useRef<SVGPolylineElement>(null);
  const records = logs.slice(0, 12).reverse();
  const values = records.map(log => metric === 'distance' ? log.distance_km : log.pace_seconds_per_km / 60);
  const max = Math.max(metric === 'distance' ? 5 : 10, ...values) * 1.15;
  const focused = records.find(log => log.id === selected);
  const points = values.map((value, index) => `${(index + .5) / values.length * 1000},${150 - value / max * 145}`).join(' ');
  useEffect(() => {
    if (!enabled || !line.current) return;
    const animation = line.current.animate([{ strokeDashoffset: 1, opacity: 0 }, { strokeDashoffset: 0, opacity: 1 }], { duration: 650, easing: 'cubic-bezier(.22,1,.36,1)' });
    return () => animation.cancel();
  }, [points, enabled]);
  return <section className={`${styles.panel} ${styles.analyticsPanel}`} aria-labelledby="analytics-heading" data-motion-region="analytics">
    <div className={styles.sectionHead}><div><p className={styles.eyebrow}>PROGRESS IN MOTION</p><h2 id="analytics-heading">Run Performance</h2></div><Activity size={23} aria-hidden="true"/></div>
    <div className={styles.chartControls}><p className={styles.muted}>สูงสุด 12 ครั้งล่าสุด · เรียงตามวันที่จริง</p><div className={styles.segmented} aria-label="เลือกข้อมูลกราฟ"><button type="button" aria-pressed={metric === 'distance'} onClick={() => setMetric('distance')}>ระยะทาง</button><button type="button" aria-pressed={metric === 'pace'} onClick={() => setMetric('pace')}>Pace</button></div></div>
    {!records.length ? <div className={styles.empty}>กราฟจะปรากฏเมื่อมีประวัติการวิ่ง<br/>ยังไม่มีข้อมูลสำหรับวิเคราะห์</div> : <>
      <div className={styles.chart} data-metric={metric}>
        <div className={styles.chartAxis}><span>{max.toFixed(1)}</span><span>{(max / 2).toFixed(1)}</span><span>0 {metric === 'distance' ? 'km' : 'min/km'}</span></div>
        <div className={styles.chartScroll}><div className={styles.chartBars} style={{ minWidth: records.length > 7 ? records.length * 45 : undefined }}>
          {metric === 'pace' && <svg className={styles.paceLine} viewBox="0 0 1000 150" preserveAspectRatio="none" aria-hidden="true"><polyline ref={line} points={points} pathLength="1"/>{values.map((value,index)=><circle key={records[index].id} cx={(index+.5)/values.length*1000} cy={150-value/max*145} r="4" vectorEffect="non-scaling-stroke"/>)}</svg>}
          {records.map((log, index) => <button key={log.id} className={styles.chartColumn} type="button" onFocus={() => setSelected(log.id)} onMouseEnter={() => setSelected(log.id)} onClick={() => setSelected(log.id)} aria-label={`${log.run_date}: ${log.distance_km} กม. ${formatPace(log.pace_seconds_per_km)}`} data-selected={selected === log.id}>
            <span className={styles.chartValue}>{metric === 'distance' ? log.distance_km.toFixed(2) : formatPace(log.pace_seconds_per_km).replace(' /km', '')}</span>
            <span className={styles.barTrack}><i style={{ transform: `scaleY(${values[index] / max})` }}/></span><span>{log.run_date.slice(5).replace('-', '/')}</span>
          </button>)}
        </div></div>
      </div>
      <div className={styles.chartHint} aria-live="polite" aria-atomic="true"><p key={`${metric}-${focused?.id ?? 'empty'}`} className={styles.chartTooltip}>{focused ? `${focused.run_date} · ${focused.distance_km.toFixed(2)} กม. · ${formatDuration(focused.duration_seconds)} · ${formatPace(focused.pace_seconds_per_km)} · ${ACTIVITY_LABELS[activityType(focused)]}` : 'แตะ ชี้ หรือใช้ Tab เลือกแท่งกราฟเพื่อดูรายละเอียด'}{metric === 'pace' && ' · ค่ายิ่งต่ำยิ่งเร็ว'}</p></div>
    </>}
  </section>;
}
