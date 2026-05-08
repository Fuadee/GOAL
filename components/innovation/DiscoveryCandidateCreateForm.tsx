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
    <form className="space-y-6 rounded-2xl border border-[#DDE3D5] bg-white/5 p-6 backdrop-blur">
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-[#1E293B]">Primary Information</h2>
        <div className="space-y-2">
          <label className="text-sm font-medium text-[#64748B]" htmlFor="title">Title *</label>
          <input id="title" name="title" required placeholder="เช่น ไฟดับซ้ำจากสายพาดต้นไม้" className="w-full rounded-xl border border-[#DDE3D5] bg-white/70 px-4 py-3 text-sm text-[#1E293B]" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-[#64748B]" htmlFor="problem">Problem</label>
          <textarea id="problem" name="problem" rows={4} placeholder="อธิบาย pain point ที่สังเกตได้" className="w-full rounded-xl border border-[#DDE3D5] bg-white/70 px-4 py-3 text-sm text-[#1E293B]" />
        </div>
      </section>

      <section className="space-y-3 rounded-xl border border-[#DDE3D5] bg-white/35 p-4">
        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#64748B]">Supporting Information</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm text-[#64748B]" htmlFor="source">Source</label>
            <input id="source" name="source" placeholder="เช่น Site report / ทีมปฏิบัติการ" className="w-full rounded-xl border border-[#DDE3D5] bg-white/70 px-4 py-3 text-sm text-[#1E293B]" />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-[#64748B]" htmlFor="concept">Concept (optional)</label>
            <input id="concept" name="concept" placeholder="แนวคิดการแก้เบื้องต้น" className="w-full rounded-xl border border-[#DDE3D5] bg-white/70 px-4 py-3 text-sm text-[#1E293B]" />
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm text-[#64748B]" htmlFor="impact_score">Impact score</label>
            <input id="impact_score" name="impact_score" type="number" placeholder="0-10" className="w-full rounded-xl border border-[#DDE3D5] bg-white/70 px-4 py-3 text-sm text-[#1E293B]" />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-[#64748B]" htmlFor="feasibility_score">Feasibility score</label>
            <input id="feasibility_score" name="feasibility_score" type="number" placeholder="0-10" className="w-full rounded-xl border border-[#DDE3D5] bg-white/70 px-4 py-3 text-sm text-[#1E293B]" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-[#64748B]" htmlFor="notes">Notes</label>
          <textarea id="notes" name="notes" rows={3} placeholder="ข้อมูลประกอบอื่น ๆ" className="w-full rounded-xl border border-[#DDE3D5] bg-white/70 px-4 py-3 text-sm text-[#1E293B]" />
        </div>
      </section>

      {error ? <p className="rounded-lg border border-rose-400/40 bg-rose-500/15 px-3 py-2 text-sm text-rose-200">{error}</p> : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={isPending}
          formAction={(formData) => handleSubmit(formData, false)}
          className="rounded-full bg-[#334155]/20 px-4 py-2 text-sm font-semibold text-[#334155] disabled:opacity-50"
        >
          {isPending ? 'Saving...' : 'Save Candidate'}
        </button>
        <button
          type="submit"
          disabled={isPending}
          formAction={(formData) => handleSubmit(formData, true)}
          className="rounded-full bg-[#EEF1EA]/20 px-4 py-2 text-sm font-semibold text-[#334155] disabled:opacity-50"
        >
          Save and Open Detail
        </button>
        <Link href="/innovation" className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-[#1E293B] hover:bg-white/20">
          Cancel / Back to Innovation
        </Link>
      </div>
    </form>
  );
}
