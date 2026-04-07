'use client';

import { Navbar } from '@/components/navbar';

export default function InnovationDetailErrorPage({ error }: { error: Error }) {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <Navbar />
      <section className="mx-auto w-full max-w-6xl px-6 py-16 md:px-10 md:py-20">
        <div className="rounded-2xl border border-rose-400/40 bg-rose-500/10 p-6 text-rose-200">
          Failed to load innovation detail: {error.message}
        </div>
      </section>
    </main>
  );
}
