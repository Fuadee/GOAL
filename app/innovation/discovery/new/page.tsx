import { DiscoveryCandidateCreateForm } from '@/components/innovation/DiscoveryCandidateCreateForm';
import { Navbar } from '@/components/navbar';

export default function NewDiscoveryCandidatePage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <section className="mx-auto w-full max-w-5xl space-y-6 px-6 py-16 md:px-10 md:py-20">
        <header className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#94A3B8]">Innovation / Discovery</p>
          <h1 className="text-3xl font-semibold text-[#1E293B]">Add Discovery Candidate</h1>
          <p className="text-[#64748B]">หน้านี้ใช้บันทึก pain point หรือโอกาสในการสร้าง innovation ใหม่</p>
        </header>

        <DiscoveryCandidateCreateForm />
      </section>
    </main>
  );
}
