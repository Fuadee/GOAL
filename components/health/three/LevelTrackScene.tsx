'use client';
import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, Check, LockKeyhole } from 'lucide-react';
import type { RunnerDashboardData } from '@/lib/running/quest.types';
import { levelRequirement } from '@/lib/running/achievements';
import { Health3DScene } from './Health3DScene';
import { useHealth3D } from './Health3DProvider';
import { useRunMotion } from '../motion/RunMotionProvider';
import type { Anchor, TrackNode } from './three.types';
import styles from './three.module.css';
import { fallbackAnchor } from './track-layout';
import { mobileFallbackAnchor, mobileFallbackPath } from './mobile-track-layout';
export function LevelTrackScene({ data, selected, onSelected }: { data: RunnerDashboardData; selected?: number; onSelected: (level:number)=>void }) {
  const tier = useHealth3D(); const { enabled } = useRunMotion();
  const [anchors, setAnchors] = useState<Anchor[]>([]);
  const [ready, setReady] = useState(false);
  const [hovered, setHovered] = useState<number>();
  const [mobile, setMobile] = useState(false);
  useEffect(()=>{const query=matchMedia('(max-width:767px)');const update=()=>setMobile(query.matches);update();query.addEventListener('change',update);return()=>query.removeEventListener('change',update);},[]);
  const nodes = useMemo<TrackNode[]>(() => data.levels.map(level => ({level:level.level_number, state:level.progress?.status ?? 'locked', label:levelRequirement(level)})), [data.levels]);
  const state = useMemo(() => ({ nodes, selected, hovered }), [nodes, selected, hovered]);
  const focused = nodes.find(node => node.level === selected) ?? nodes.find(node => node.state === 'available') ?? nodes[nodes.length-1];
  const is3D = ready && tier !== 'fallback';
  function open(level: number) {
    onSelected(level);
    const detail = document.querySelector<HTMLDetailsElement>(`details[data-level="${level}"]`);
    if (detail) { detail.open = true; detail.scrollIntoView({behavior:enabled?'smooth':'instant',block:'center'}); detail.querySelector('summary')?.focus({preventScroll:true}); }
  }
  function select(level:number){onSelected(level);const detail=document.querySelector<HTMLDetailsElement>(`details[data-level="${level}"]`);if(detail)detail.open=true;}
  return <div className={styles.track} data-track-mode={is3D ? tier : 'fallback'} data-track-motion={enabled} data-track-layout={mobile?'mobile-s':'desktop-staircase'}>
    <div className={styles.trackHeading}><span>YOUR PATH / 01—10</span><span>{is3D ? '3D TRACK' : 'LEVEL ROUTE'}</span></div>
    <div className={styles.trackScroll}>
      <div className={styles.trackStage} data-ready={is3D}>
        <Health3DScene kind="track" state={state} onAnchors={setAnchors} onReady={setReady}/>
        {!is3D&&<svg className={styles.fallbackRoute} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d={mobile?mobileFallbackPath():"M12 86 L86.7 16.7"}/></svg>}
        <div className={styles.nodes} role="group" aria-label="เลือกจุดบนเส้นทาง 10 ระดับ" onKeyDown={event=>{const buttons=Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('button'));const index=buttons.indexOf(document.activeElement as HTMLButtonElement);const next=event.key==='Home'?0:event.key==='End'?9:event.key==='ArrowRight'||event.key==='ArrowUp'?Math.min(9,index+1):event.key==='ArrowLeft'||event.key==='ArrowDown'?Math.max(0,index-1):-1;if(next>=0){event.preventDefault();buttons[next]?.focus();}}}>
          {nodes.map((node,index) => {
            const anchor = is3D ? anchors.find(item=>item.level===node.level) : null;
            const fallback=mobile?mobileFallbackAnchor(index):fallbackAnchor(index);
            return <button key={node.level} type="button" className={styles.node} data-three-level={node.level} data-state={node.state} data-selected={focused?.level===node.level} aria-pressed={focused?.level===node.level} aria-label={`เส้นทาง Level ${node.level}: ${node.state==='passed'?'ผ่านแล้ว':node.state==='available'?'ระดับปัจจุบัน':'ยังล็อก'} · ${node.label}${node.level===10?' · FINISH 5K':''}`} aria-controls={`running-level-${node.level}`}
              style={{left:`${anchor?.x ?? fallback.x}%`,top:`${anchor?.y ?? fallback.y}%`}}
              onMouseEnter={()=>setHovered(node.level)} onMouseLeave={()=>setHovered(undefined)} onFocus={()=>onSelected(node.level)} onClick={()=>select(node.level)}>
              {node.state==='passed'?<Check size={13} aria-hidden="true"/>:node.state==='locked'?<LockKeyhole size={11} aria-hidden="true"/>:null}<b>{String(node.level).padStart(2,'0')}</b>
            </button>;
          })}
        </div>
      </div>
    </div>
    <div className={styles.trackDetail} aria-live="polite" data-selected-detail={focused?.level}><span key={focused?.level}><b>LEVEL {String(focused?.level ?? 1).padStart(2,'0')}</b> · {focused?.label}</span><button type="button" onClick={()=>focused&&open(focused.level)}>ดูรายละเอียด <ArrowUpRight size={14}/></button></div>
    <p className={styles.trackHelp}>เลือกจุดเพื่อดูเงื่อนไข · สว่าง = ผ่านแล้ว · วงแหวนเด่น = ระดับปัจจุบัน</p>
  </div>;
}
