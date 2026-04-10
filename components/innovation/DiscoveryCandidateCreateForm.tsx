'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { createDiscoveryCandidateAction } from '@/app/innovation/actions';

export function DiscoveryCandidateCreateForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (formData: FormData, openDetail: boolean) => {
    setError(null);
    startTransition(async () => {
      const result = await createDiscoveryCandidateAction(formData);

      if (!result.success) {
        setError(result.message);
        return;
      }

      if (openDetail && result.candidateId) {
        router.push(`/innovation/discovery/${result.candidateId}`);
        return;
      }

      router.push('/innovation');
    });
  };

  return (
    <form className="space-y-6 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-white">Primary Information</h2>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200" htmlFor="title">Title *</label>
          <input id="title" name="title" required placeholder="เช่น ไฟดับซ้ำจากสายพาดต้นไม้" className="w-full rounded-xl border border-white/15 bg-slate-900/70 px-4 py-3 text-sm text-white" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200" htmlFor="problem">Problem</label>
          <textarea id="problem" name="problem" rows={4} placeholder="อธิบาย pain point ที่สังเกตได้" className="w-full rounded-xl border border-white/15 bg-slate-900/70 px-4 py-3 text-sm text-white" />
        </div>
      </section>

      <section className="space-y-3 rounded-xl border border-white/10 bg-slate-900/35 p-4">
        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">Supporting Information</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm text-slate-300" htmlFor="source">Source</label>
            <input id="source" name="source" placeholder="เช่น Site report / ทีมปฏิบัติการ" className="w-full rounded-xl border border-white/15 bg-slate-900/70 px-4 py-3 text-sm text-white" />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-slate-300" htmlFor="concept">Concept (optional)</label>
            <input id="concept" name="concept" placeholder="แนวคิดการแก้เบื้องต้น" className="w-full rounded-xl border border-white/15 bg-slate-900/70 px-4 py-3 text-sm text-white" />
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm text-slate-300" htmlFor="impact_score">Impact score</label>
            <input id="impact_score" name="impact_score" type="number" placeholder="0-10" className="w-full rounded-xl border border-white/15 bg-slate-900/70 px-4 py-3 text-sm text-white" />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-slate-300" htmlFor="feasibility_score">Feasibility score</label>
            <input id="feasibility_score" name="feasibility_score" type="number" placeholder="0-10" className="w-full rounded-xl border border-white/15 bg-slate-900/70 px-4 py-3 text-sm text-white" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-slate-300" htmlFor="notes">Notes</label>
          <textarea id="notes" name="notes" rows={3} placeholder="ข้อมูลประกอบอื่น ๆ" className="w-full rounded-xl border border-white/15 bg-slate-900/70 px-4 py-3 text-sm text-white" />
        </div>
      </section>

      {error ? <p className="rounded-lg border border-rose-400/40 bg-rose-500/15 px-3 py-2 text-sm text-rose-200">{error}</p> : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={isPending}
          formAction={(formData) => handleSubmit(formData, false)}
          className="rounded-full bg-cyan-400/20 px-4 py-2 text-sm font-semibold text-cyan-100 disabled:opacity-50"
        >
          {isPending ? 'Saving...' : 'Save Candidate'}
        </button>
        <button
          type="submit"
          disabled={isPending}
          formAction={(formData) => handleSubmit(formData, true)}
          className="rounded-full bg-indigo-400/20 px-4 py-2 text-sm font-semibold text-indigo-100 disabled:opacity-50"
        >
          Save and Open Detail
        </button>
        <Link href="/innovation" className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20">
          Cancel / Back to Innovation
        </Link>
      </div>
    </form>
  );
}
