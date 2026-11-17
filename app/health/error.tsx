'use client';

import Link from 'next/link';
import styles from '@/components/health/running.module.css';

export default function HealthError() {
  // A full navigation retries the server component too; resetting only the client
  // boundary can replay Next 14's failed server payload without fetching again.
  return <div className={styles.shell}><div className={`${styles.container} ${styles.dashboard}`}><section className={styles.panel} role="alert"><h1>โหลดประวัติการวิ่งไม่สำเร็จ</h1><p>กรุณาตรวจการเชื่อมต่อแล้วลองอีกครั้ง ข้อมูลเดิมไม่ได้ถูกเปลี่ยนแปลง</p><button type="button" className={styles.primaryButton} onClick={() => window.location.reload()}>ลองโหลดใหม่</button><Link href="/dashboard">กลับหน้าภาพรวม</Link></section></div></div>;
}
