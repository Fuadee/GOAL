import { Navbar } from '@/components/navbar';

export default function MoneyManagementPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <Navbar />

      <section className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-5xl items-center justify-center px-6 py-10">
        <article className="w-full max-w-2xl rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center shadow-2xl shadow-black/30">
          <p className="text-xs uppercase tracking-[0.3em] text-indigo-200/70">Project Status</p>
          <h1 className="mt-3 text-4xl font-semibold text-white">Project 100K</h1>
          <p className="mt-4 text-slate-300">This is a new project. System reset completed.</p>

          <div className="mt-8 inline-flex items-center rounded-full border border-emerald-300/30 bg-emerald-500/10 px-4 py-1.5 text-sm font-medium text-emerald-200">
            Status: Initialized
          </div>
        </article>
      </section>
    </main>
  );
}
