import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { ProgressRing } from '@/components/dashboard/ProgressRing';
import { ModuleProgressCard } from '@/components/dashboard/ModuleProgressCard';
import { DashboardRefresh } from '@/components/dashboard/DashboardRefresh';
import { getLifeDashboardData } from '@/lib/dashboard/service';
import { getFocusActions, getOverallProgress } from '@/lib/dashboard/progress';
import styles from '@/components/dashboard/life-dashboard.module.css';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'ภาพรวมเส้นทางชีวิต | GOAL' };

export default async function DashboardPage() {
  const modules = await getLifeDashboardData();
  const overall = getOverallProgress(modules);
  const focus = getFocusActions(modules);
  return <main className={styles.dashboard}>
    <Navbar />
    <div className={styles.container}>
      <div className={styles.topline}><span>GOAL <span className={styles.toplineDivider}>/</span> LIFE MISSION CONTROL</span><DashboardRefresh /></div>
      <section className={styles.hero} aria-labelledby="life-title">
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}><span /> ทุกก้าว มีความหมาย</p>
          <h1 id="life-title">ภาพรวมเส้นทาง<br />ชีวิตของฉัน<span className={styles.titleDot}>.</span></h1>
          <p className={styles.intro}>มองเห็นสิ่งที่ทำสำเร็จ เชื่อมทุกเป้าหมายเข้าด้วยกัน<br className={styles.desktopBreak} /> แล้วเลือกก้าวถัดไปที่สำคัญกับคุณ</p>
          <a href="#life-focus" className={styles.heroLink}>ค้นหาสิ่งที่ควรโฟกัส <ArrowRight size={17} aria-hidden="true" /></a>
          <div className={styles.heroStats}><div><strong>{overall.measuredCount}<span> / {modules.length}</span></strong><p>ด้านที่วัดความคืบหน้าได้</p></div><div><strong>{focus.length}</strong><p>สิ่งที่พร้อมเดินต่อ</p></div></div>
        </div>
        <div className={styles.heroVisual}><ProgressRing percentage={overall.percentage} precision={1} hero /><p className={styles.orbNote}>ค่าเฉลี่ยจาก {overall.measuredCount} ด้านที่มีข้อมูลจริง</p></div>
      </section>
      <section className={styles.modulesSection} aria-labelledby="modules-title">
        <div className={styles.sectionHeader}><div><p className={styles.eyebrow}>YOUR GOALS, IN MOTION</p><h2 id="modules-title">ความคืบหน้าของสิ่งที่ลงมือทำ</h2></div><p>ทุกก้าวที่ลงมือทำ พาคุณเข้าใกล้เป้าหมาย</p></div>
        <div className={styles.moduleGrid}>{modules.map((module) => <ModuleProgressCard key={module.id} module={module} />)}</div>
        <p className={styles.methodNote}>ภาพรวมใช้ค่าเฉลี่ยเท่ากันทุกด้านที่วัดได้ ไม่รวมด้านที่ยังไม่มีข้อมูล • การเงินใช้สัดส่วนงบที่จ่ายตามหน้าต้นทาง และอาจเกิน 100% เมื่อใช้เกินงบ</p>
      </section>
      <section className={styles.focusSection} id="life-focus" aria-labelledby="focus-title">
        <div className={styles.sectionHeader}><div><p className={styles.eyebrow}>MAKE YOUR NEXT MOVE</p><h2 id="focus-title">ตอนนี้ควรโฟกัสอะไร</h2></div><p>แผนที่มีวันนัดก่อน ตามด้วยด้านที่ยังคืบหน้าน้อย</p></div>
        {focus.length ? <div className={styles.focusList}>{focus.map((module, index) => <Link className={styles.focusRow} key={module.id} href={module.nextAction!.href} prefetch={false}><span className={styles.focusNumber}>0{index + 1}</span><div className={styles.focusText}><p>{module.title}</p><h3>{module.nextAction!.title}</h3>{module.nextAction!.detail && <span>{module.nextAction!.detail}</span>}</div><ArrowUpRight size={21} aria-hidden="true" /></Link>)}</div> : <p className={styles.emptyFocus}>ยังไม่มีงานถัดไปที่ระบุได้จากข้อมูลปัจจุบัน เมื่อมี Milestone งานค้าง หรือแผนถัดไป ระบบจะแสดงที่นี่</p>}
      </section>
      <footer className={styles.footer}><span>GOAL</span><p>ชีวิตที่ตั้งใจ ค่อย ๆ สร้างได้ทุกวัน</p></footer>
    </div>
  </main>;
}
