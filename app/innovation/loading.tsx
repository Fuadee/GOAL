import { Navbar } from '@/components/navbar';

export default function InnovationLoadingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <Navbar />
      <section className="mx-auto w-full max-w-6xl px-6 py-16 text-slate-300 md:px-10 md:py-20">Loading innovation data...</section>
    </main>
  );
}
