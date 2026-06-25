import { Navbar } from '@/components/navbar';

export default function InnovationLoadingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <Navbar />
      <section className="page-container py-16 text-slate-300 md:py-20">กำลังโหลดข้อมูลนวัตกรรม...</section>
    </main>
  );
}
