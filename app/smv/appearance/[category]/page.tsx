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
        <Link href="/smv/appearance" className="text-sm text-[#64748B] hover:text-[#334155]">← กลับไปหน้า Appearance</Link>

        <header className="rounded-3xl border border-[#DDE3D5]/30 bg-white p-6">
          <h1 className="text-3xl font-semibold text-[#1E293B]">{category.category.titleTh}</h1>
          <p className="mt-3 text-4xl font-semibold text-[#334155]">{category.score} / {category.maxScore}</p>
          <p className="mt-1 text-sm text-[#64748B]">ด่านปัจจุบัน: {category.currentLevel} • หลักฐานสะสม: {category.evidenceCount}</p>
          <p className="mt-2 text-sm text-[#334155]">สถานะ: {category.nextLevel ? `กำลังไต่ไปด่าน ${category.nextLevel}` : 'ผ่านครบทุกด่านแล้ว'}</p>
        </header>

        <article className="rounded-3xl border border-[#DDE3D5] bg-white/5 p-5">
          <h2 className="text-lg font-semibold text-[#1E293B]">ด่านทั้งหมด</h2>
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
                        ? 'border-[#DDE3D5]/70 bg-[#EEF1EA]/10 shadow-sm'
                        : 'border-[#DDE3D5] bg-[#F6F7F4]/30 opacity-80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-[#1E293B]">ด่าน {level.level}: {level.title}</p>
                    <span className={`rounded-full border px-2 py-1 text-xs ${isPassed ? 'border-emerald-200/50 text-emerald-100' : isNext ? 'border-[#DDE3D5] text-[#334155]' : 'border-slate-500/50 text-[#64748B]'}`}>
                      {isPassed ? 'ผ่านแล้ว' : isNext ? 'ด่านถัดไป' : 'ล็อกอยู่'}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-[#64748B]">{level.description}</p>
                  <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-[#64748B]">
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
                        <button type="submit" className="rounded-full bg-[#334155] px-4 py-1.5 text-xs font-semibold text-slate-900">ปลดล็อกด่านนี้</button>
                      </form>
                      <Link href={`/smv/log?dimension=look&appearance_category=${category.category.key}&target_level=${level.level}`} className="rounded-full border border-[#DDE3D5] px-4 py-1.5 text-xs font-semibold text-[#334155]">เพิ่มหลักฐาน</Link>
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
