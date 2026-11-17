import { Navbar } from '@/components/navbar';

export default function DashboardLoading() {
  return <main className="min-h-screen bg-slate-50"><Navbar /><div role="status" className="mx-auto max-w-7xl px-6 py-24 text-slate-600">กำลังรวบรวมความคืบหน้าของคุณ…</div></main>;
}
