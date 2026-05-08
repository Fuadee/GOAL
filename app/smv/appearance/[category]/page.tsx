import Link from 'next/link';
import { notFound } from 'next/navigation';

import { updateAppearanceLevelAction } from '@/app/smv/actions';
import { Navbar } from '@/components/navbar';
import { APPEARANCE_CATEGORY_KEYS } from '@/lib/smv/appearance-config';
import { getAppearanceDetailData } from '@/lib/smv/service';

export default async function SmvAppearanceCategoryPage({ params }: { params: { category: string } }) {
  if (!APPEARANCE_CATEGORY_KEYS.includes(params.category as (typeof APPEARANCE_CATEGORY_KEYS)[number])) {
    notFound();
  }

  const detail = await getAppearanceDetailData();
  if (!detail) notFound();

  const category = detail.categorySummary.find((item) => item.category.key === params.category);
  if (!category) notFound();

  return (
    <main className="app-shell">
      <Navbar />
      <section className="mx-auto w-full max-w-5xl space-y-6 px-4 py-8 md:px-8">
        <Link href="/smv/appearance" className="text-sm text-cyan-200 hover:text-cyan-100">← กลับไปหน้า Appearance</Link>

        <header className="rounded-3xl border border-cyan-300/30 bg-gradient-to-br from-slate-900 via-cyan-950/20 to-slate-900 p-6">
          <h1 className="text-3xl font-semibold text-white">{category.category.titleTh}</h1>
          <p className="mt-3 text-4xl font-semibold text-cyan-100">{category.score} / {category.maxScore}</p>
          <p className="mt-1 text-sm text-slate-300">ด่านปัจจุบัน: {category.currentLevel} • หลักฐานสะสม: {category.evidenceCount}</p>
          <p className="mt-2 text-sm text-cyan-100">สถานะ: {category.nextLevel ? `กำลังไต่ไปด่าน ${category.nextLevel}` : 'ผ่านครบทุกด่านแล้ว'}</p>
        </header>

        <article className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-lg font-semibold text-white">ด่านทั้งหมด</h2>
          <div className="mt-4 space-y-3">
            {category.category.levels.map((level) => {
              const isPassed = level.level <= category.currentLevel;
              const isCurrent = level.level === category.currentLevel + 1 || (!category.nextLevel && level.level === category.currentLevel);
              const isNext = level.level === category.currentLevel + 1;

              return (
                <div
                  key={level.level}
                  className={`rounded-2xl border p-4 ${
                    isPassed
                      ? 'border-emerald-300/40 bg-emerald-500/10'
                      : isCurrent
                        ? 'border-cyan-300/70 bg-cyan-500/10 shadow-[0_0_24px_rgba(34,211,238,0.3)]'
                        : 'border-white/10 bg-slate-950/30 opacity-80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-white">ด่าน {level.level}: {level.title}</p>
                    <span className={`rounded-full border px-2 py-1 text-xs ${isPassed ? 'border-emerald-200/50 text-emerald-100' : isNext ? 'border-cyan-200/50 text-cyan-100' : 'border-slate-500/50 text-slate-300'}`}>
                      {isPassed ? 'ผ่านแล้ว' : isNext ? 'ด่านถัดไป' : 'ล็อกอยู่'}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-200">{level.description}</p>
                  <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-slate-300">
                    {level.criteria.map((item) => <li key={item}>{item}</li>)}
                  </ul>

                  {isNext ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      <form
                        action={async (formData) => {
                          'use server';
                          await updateAppearanceLevelAction(formData);
                        }}
                      >
                        <input type="hidden" name="category_key" value={category.category.key} />
                        <input type="hidden" name="unlocked_level" value={level.level} />
                        <button type="submit" className="rounded-full bg-cyan-300 px-4 py-1.5 text-xs font-semibold text-slate-900">ปลดล็อกด่านนี้</button>
                      </form>
                      <Link href={`/smv/log?dimension=look&appearance_category=${category.category.key}&target_level=${level.level}`} className="rounded-full border border-cyan-200/40 px-4 py-1.5 text-xs font-semibold text-cyan-100">เพิ่มหลักฐาน</Link>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </article>
      </section>
    </main>
  );
}
