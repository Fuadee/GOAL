'use client';

import { useMemo, useState } from 'react';

type ApproachItem = {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'done';
};

type RelationshipMissionDashboardProps = {
  startedAt: string;
  approaches: ApproachItem[];
};

export function RelationshipMissionDashboard({ startedAt, approaches }: RelationshipMissionDashboardProps) {
  const [achieved, setAchieved] = useState(false);
  const [isReflectionOpen, setIsReflectionOpen] = useState(false);
  const [reflection, setReflection] = useState(
    'เริ่มเข้าใจแล้วว่าจริงๆ ตัวเองต้องการ connection แบบไหน และไม่อยากฝืนตัวเองไปอยู่ใน environment ที่ไม่ใช่'
  );

  const movementStarted = useMemo(() => approaches.filter((item) => item.status === 'active' || item.status === 'done').length, [approaches]);
  const progressPercent = achieved ? 100 : Math.min(100, Math.round((movementStarted / 4) * 100));

  return (
    <section className="mx-auto w-full max-w-6xl space-y-5 px-4 pb-10 pt-6 md:px-6 md:pt-8">
      <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950 via-[#0b1420] to-[#142534] p-6 shadow-2xl shadow-black/25 md:p-8">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.2em] text-teal-200/80">Current Mission</p>
          <h1 className="text-3xl font-semibold text-white md:text-4xl">Go on 1 Real Date</h1>
          <p className="max-w-3xl text-sm leading-relaxed text-slate-300 md:text-base">เป้าหมายตอนนี้ไม่ใช่การมีแฟนทันที แต่คือการเปิดชีวิตตัวเองอีกครั้ง</p>
          <span className="inline-flex w-fit rounded-full border border-emerald-300/30 bg-emerald-300/15 px-3 py-1 text-xs font-medium text-emerald-100">IN PROGRESS</span>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-[#0e1824] p-5 shadow-xl shadow-black/20 md:p-6">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-teal-200/80">Progress</p>
            <p className="mt-1 text-3xl font-semibold text-white">{progressPercent}%</p>
          </div>
          <p className="text-sm text-slate-300">{movementStarted} / 4 Movement Started</p>
        </div>
        <div className="mt-4 h-2.5 rounded-full bg-slate-800">
          <div className="h-2.5 rounded-full bg-gradient-to-r from-teal-300 via-emerald-300 to-amber-300" style={{ width: `${progressPercent}%` }} />
        </div>
        <p className="mt-3 text-sm text-slate-400">Started: {startedAt}</p>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-3xl border border-white/10 bg-[#0e1824] p-5 shadow-xl shadow-black/20 md:p-6">
          <h2 className="text-xs uppercase tracking-[0.2em] text-teal-200/80">Current Approach</h2>
          <div className="mt-4 space-y-3">
            {approaches.map((item) => (
              <div key={item.id} className="rounded-2xl border border-white/10 bg-slate-900/50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full border border-teal-200/30 bg-teal-300/15 text-teal-100">◉</span>
                    <div>
                      <p className="text-sm font-medium text-white">{item.title}</p>
                      <p className="mt-1 text-xs text-slate-300">{item.description}</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300/30 bg-emerald-300/15 px-2.5 py-1 text-xs text-emerald-100"><span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />กำลังทำ</span>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-3xl border border-white/10 bg-[#0e1824] p-5 shadow-xl shadow-black/20 md:p-6">
          <h2 className="text-xs uppercase tracking-[0.2em] text-amber-200/90">Reward</h2>
          <h3 className="mt-2 text-2xl font-semibold text-white">เที่ยวคนเดียว</h3>
          <p className="mt-2 text-sm text-slate-300">ให้รางวัลกับตัวเอง หลังจากได้ไป Date จริง 1 ครั้ง</p>
          <div className="mt-4 h-36 rounded-2xl border border-white/10 bg-[linear-gradient(120deg,rgba(20,184,166,0.15),rgba(245,158,11,0.2)),url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center" />
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            {['Reset', 'Freedom', 'Growth', 'New Experience'].map((tag) => (
              <span key={tag} className="rounded-full border border-white/15 px-2.5 py-1 text-slate-200">{tag}</span>
            ))}
          </div>
          <p className="mt-4 text-sm text-slate-300">จังหวัดใกล้เคียงที่อยากไป</p>
          <p className="text-sm text-slate-400">ภูเก็ต • พังงา • เกาะลันตา • หรือที่ไหนก็ได้ที่สบายใจ</p>
          {achieved ? <p className="mt-3 text-sm font-medium text-emerald-200">Reward unlocked ✨</p> : null}
        </article>
      </section>

      <section className="rounded-3xl border border-white/10 bg-[#0e1824] p-5 shadow-xl shadow-black/20 md:p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xs uppercase tracking-[0.2em] text-teal-200/80">Last Reflection</h2>
          <button type="button" onClick={() => setIsReflectionOpen(true)} className="rounded-lg border border-white/20 px-3 py-1.5 text-xs text-slate-200 hover:bg-white/5">บันทึก Reflection</button>
        </div>
        <p className="mt-4 text-base italic text-slate-100">“{reflection}”</p>
        <p className="mt-3 text-xs text-slate-400">24 May 2026</p>
      </section>

      <section className="rounded-3xl border border-white/10 bg-[#0e1824] p-5 shadow-xl shadow-black/20 md:p-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="text-xs uppercase tracking-[0.2em] text-teal-200/80">Success Condition</h2>
            <p className="mt-2 text-3xl font-semibold text-white">ได้ไป Date จริง 1 ครั้ง</p>
            <p className="mt-1 text-sm text-slate-300">แค่นี้ก็ถือว่าชนะแล้ว</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4 text-right">
            <p className="text-2xl font-semibold text-white">{achieved ? '1 / 1' : '0 / 1'}</p>
            <p className={`text-sm ${achieved ? 'text-emerald-200' : 'text-slate-400'}`}>{achieved ? 'Achieved' : 'Not Yet Achieved'}</p>
          </div>
        </div>
        <button type="button" onClick={() => setAchieved(true)} disabled={achieved} className="mt-4 rounded-xl bg-gradient-to-r from-teal-300 to-emerald-300 px-4 py-2 text-sm font-semibold text-slate-900 disabled:cursor-not-allowed disabled:opacity-60">Mark as Achieved</button>
      </section>

      <p className="pb-2 text-center text-sm text-slate-400">โฟกัสที่การเปิดชีวิต ไม่ใช่การฝืนความรัก</p>

      {isReflectionOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <button type="button" className="absolute inset-0 bg-black/70" onClick={() => setIsReflectionOpen(false)} />
          <div className="relative z-10 w-full max-w-lg rounded-2xl border border-white/15 bg-slate-900 p-5">
            <h3 className="text-lg font-semibold text-white">บันทึก Reflection</h3>
            <textarea value={reflection} onChange={(event) => setReflection(event.target.value)} rows={5} className="mt-3 w-full rounded-xl border border-white/20 bg-slate-950 px-3 py-2 text-sm text-white" />
            <div className="mt-4 flex justify-end">
              <button type="button" onClick={() => setIsReflectionOpen(false)} className="rounded-lg bg-teal-300 px-4 py-2 text-sm font-semibold text-slate-900">บันทึก</button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
