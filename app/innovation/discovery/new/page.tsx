import { DiscoveryCandidateCreateForm } from '@/components/innovation/DiscoveryCandidateCreateForm';
import { Navbar } from '@/components/navbar';

export default function NewDiscoveryCandidatePage() {
  return (
    <main className="min-h-screen bg-slate-100/70">
      <Navbar />
      <section className="mx-auto w-full max-w-5xl space-y-5 px-4 py-5 md:px-6 md:py-6">
        <header className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Innovation / ไอเดีย</p>
          <h1 className="text-2xl font-semibold text-slate-950 sm:text-3xl">เพิ่มไอเดียรอคัดเลือก</h1>
          <p className="text-slate-500">หน้านี้ใช้บันทึก pain point หรือโอกาสในการสร้าง innovation ใหม่</p>
        </header>

        <DiscoveryCandidateCreateForm />
      </section>
    </main>
  );
}
