'use client';

import { RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import styles from './life-dashboard.module.css';

export function DashboardRefresh() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return <button type="button" className={styles.refresh} disabled={pending} onClick={() => startTransition(() => router.refresh())}><RefreshCw size={14} aria-hidden="true" /><span aria-live="polite">{pending ? 'กำลังโหลด…' : 'รีเฟรชข้อมูล'}</span></button>;
}
