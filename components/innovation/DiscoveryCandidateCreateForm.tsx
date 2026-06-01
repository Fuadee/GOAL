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
    <form className="space-y-6 rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-[0_20px_45px_-30px_rgba(15,23,42,0.28)] sm:p-6">
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-950">ข้อมูลหลัก</h2>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="title">ชื่อไอเดีย *</label>
          <input id="title" name="title" required placeholder="เช่น ไฟดับซ้ำจากสายพาดต้นไม้" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="problem">ปัญหา</label>
          <textarea id="problem" name="problem" rows={4} placeholder="อธิบาย pain point ที่สังเกตได้" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100" />
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">ข้อมูลประกอบ</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm text-slate-700" htmlFor="source">แหล่งที่มา</label>
            <input id="source" name="source" placeholder="เช่น Site report / ทีมปฏิบัติการ" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100" />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-slate-700" htmlFor="concept">แนวคิด (ถ้ามี)</label>
            <input id="concept" name="concept" placeholder="แนวคิดการแก้เบื้องต้น" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100" />
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm text-slate-700" htmlFor="impact_score">คะแนนผลกระทบ</label>
            <input id="impact_score" name="impact_score" type="number" placeholder="0-10" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100" />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-slate-700" htmlFor="feasibility_score">คะแนนความเป็นไปได้</label>
            <input id="feasibility_score" name="feasibility_score" type="number" placeholder="0-10" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-slate-700" htmlFor="notes">บันทึกเพิ่มเติม</label>
          <textarea id="notes" name="notes" rows={3} placeholder="ข้อมูลประกอบอื่น ๆ" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100" />
        </div>
      </section>

      {error ? <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={isPending}
          formAction={(formData) => handleSubmit(formData, false)}
          className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm disabled:opacity-50"
        >
          {isPending ? 'กำลังบันทึก...' : 'บันทึกไอเดีย'}
        </button>
        <button
          type="submit"
          disabled={isPending}
          formAction={(formData) => handleSubmit(formData, true)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm disabled:opacity-50"
        >
          บันทึกและเปิดรายละเอียด
        </button>
        <Link href="/innovation" className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50">
          ยกเลิก / กลับหน้า Innovation
        </Link>
      </div>
    </form>
  );
}
