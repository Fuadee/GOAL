'use client';

import Image from 'next/image';
import { ArrowUpRight, Footprints, Timer } from 'lucide-react';

import styles from '../running.module.css';
import { HeroShoeScene } from '../three/HeroShoeScene';

export function CinematicHero({ goalImageUrl }: { goalImageUrl: string | null }) {
  return <header className={styles.hero} data-motion-region="hero" data-entered="true" data-visible="true">
    <div className={styles.ambient} aria-hidden="true"/>
    <div className={styles.trackArt} aria-hidden="true"><i/><i/><i/></div>
    <div className={styles.lightTrails} aria-hidden="true"><i/><i/><i/></div>
    <HeroShoeScene/>
    <div className={styles.energy} aria-hidden="true"/>
    <div className={styles.heroCoordinates} aria-hidden="true"><span>PERSONAL RECORD / IN PROGRESS</span><b>01 — 10</b></div>
    <div className={styles.heroCopy}>
      <span className={styles.pill}><Footprints size={14} aria-hidden="true"/> 10 LEVELS. ONE FINISH LINE.</span>
      <h1 aria-label="ROAD TO 5K."><span className={styles.titleMask} aria-hidden="true"><span>ROAD</span><span>TO</span></span><em className={styles.titleFive} aria-hidden="true"><span>5K.</span><i/></em></h1>
      <p className={styles.slogan}>KEEP MOVING.<br/><span>BREAK THE NEXT LEVEL.</span></p>
      <p className={styles.heroDescription}>วิ่ง 5 กิโลเมตรต่อเนื่องให้สำเร็จ<br/>ทุกระดับปลดล็อกจากผลงานจริงของคุณ</p>
      <a className={styles.heroLink} href="#run-log">บันทึกการวิ่งครั้งใหม่ <ArrowUpRight size={19} aria-hidden="true"/></a>
    </div>
    <div className={styles.goalMark}>
      {goalImageUrl && <div className={styles.visionThumb}><Image src={goalImageUrl} alt="ภาพเป้าหมายการวิ่งจาก Vision Board" fill sizes="64px" className={styles.image}/></div>}
      <span>THE FINISH LINE</span><strong>5<span>KM</span></strong>
      <div><Timer size={18} aria-hidden="true"/><b>40:00</b><span>นาที</span></div>
      <small>PACE ≤ 8:00 /KM · วิ่งต่อเนื่อง</small>
    </div>
    <div className={styles.heroBaseline} aria-hidden="true"><span>START WHERE YOU ARE</span><i/><span>GO BEYOND.</span></div>
  </header>;
}
