import styles from '@/components/health/running.module.css';

export default function HealthLoading() {
  return <div className={styles.shell}><div className={styles.container} role="status" aria-live="polite"><div className={styles.panel}><p>ROAD TO 5K</p><h1>กำลังโหลดประวัติการวิ่ง…</h1><p>กำลังประเมินทั้ง 10 Levels จากข้อมูลของคุณ</p></div></div></div>;
}
