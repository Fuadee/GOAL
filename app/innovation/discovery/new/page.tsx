import { DiscoveryCandidateCreateForm } from '@/components/innovation/DiscoveryCandidateCreateForm';
import { Navbar } from '@/components/navbar';

export default function NewDiscoveryCandidatePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <Navbar />
      <section className="mx-auto w-full max-w-5xl space-y-6 px-6 py-16 md:px-10 md:py-20">
        <header className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Innovation / Discovery</p>
          <h1 className="text-3xl font-semibold text-white">Add Discovery Candidate</h1>
          <p className="text-slate-300">หน้านี้ใช้บันทึก pain point หรือโอกาสในการสร้าง innovation ใหม่</p>
        </header>

        <DiscoveryCandidateCreateForm />
      </section>
    </main>
  );
}
