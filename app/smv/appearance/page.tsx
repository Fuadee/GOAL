import Link from 'next/link';

import { Navbar } from '@/components/navbar';
import { getAppearanceDetailData } from '@/lib/smv/service';

export default async function SmvAppearancePage() {
  const detail = await getAppearanceDetailData();

  if (!detail) {
    return null;
  }

  return (
    <main className="app-shell">
      <Navbar />
      <section className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8 md:px-8">
        <Link href="/smv" className="text-sm text-cyan-200 hover:text-cyan-100">← กลับไปหน้า /smv</Link>

        <header className="rounded-3xl border border-cyan-300/30 bg-gradient-to-br from-slate-900 via-cyan-950/20 to-slate-900 p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Appearance Power</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">รูปร่างหน้าตา / บุคลิกที่ดี</h1>
          <p className="mt-3 text-5xl font-semibold text-cyan-100">{detail.totalScore} / 100</p>
          <p className="mt-2 text-sm text-slate-200">คะแนนรวมจาก 3 ด้าน: การแต่งตัว (40) + ร่างกาย (30) + Grooming (30)</p>
        </header>

        <article className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-lg font-semibold text-white">สรุประดับพลัง</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <p className="rounded-xl border border-emerald-300/30 bg-emerald-500/10 p-3 text-sm text-emerald-100">จุดเด่นที่สุดตอนนี้: {detail.strongest?.category.titleTh ?? '-'}</p>
            <p className="rounded-xl border border-amber-300/30 bg-amber-500/10 p-3 text-sm text-amber-100">จุดที่ควรเร่งอัป: {detail.weakest?.category.titleTh ?? '-'}</p>
            <p className="rounded-xl border border-cyan-300/30 bg-cyan-500/10 p-3 text-sm text-cyan-100">ด่านถัดไปที่ใกล้สุด: {detail.nextClosest?.category.titleTh ?? 'ผ่านครบทุกหมวดแล้ว'} </p>
            <p className="rounded-xl border border-white/10 bg-slate-900/60 p-3 text-sm text-slate-200">คะแนนที่ยังขาดถึง 100: {detail.scoreRemaining}</p>
          </div>
        </article>

        <section className="grid gap-4 md:grid-cols-3">
          {detail.categorySummary.map((entry) => (
            <article key={entry.category.key} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
              <p className="text-sm text-slate-300">{entry.category.titleTh}</p>
              <p className="mt-1 text-2xl font-semibold text-cyan-100">{entry.score} / {entry.maxScore}</p>
              <p className="mt-1 text-xs text-slate-300">ด่านปัจจุบัน: {entry.currentLevel}</p>
              <div className="mt-3 h-2 w-full rounded-full bg-slate-800">
                <div className="h-2 rounded-full bg-cyan-300" style={{ width: `${entry.progressPercent}%` }} />
              </div>
              <p className="mt-3 text-xs text-slate-300">{entry.category.shortDescription}</p>
              <p className="mt-2 text-xs text-cyan-100">ด่านถัดไป: {entry.nextLevel ? `ด่าน ${entry.nextLevel} • ${entry.nextLevelTitle}` : 'ผ่านครบทุกด่านแล้ว'}</p>
              <div className="mt-3 flex gap-2">
                <Link href={`/smv/appearance/${entry.category.key}`} className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white">ดูรายละเอียด</Link>
                <Link href={`/smv/log?dimension=look&appearance_category=${entry.category.key}`} className="rounded-full border border-cyan-200/40 px-3 py-1.5 text-xs font-semibold text-cyan-100">เพิ่มหลักฐาน</Link>
              </div>
            </article>
          ))}
        </section>
      </section>
    </main>
  );
}
