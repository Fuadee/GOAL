import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Navbar } from '@/components/navbar';
import { ConfidenceStageConfirmButton } from '@/components/smv/ConfidenceStageConfirmButton';
import { SMV_DIMENSION_LABELS } from '@/lib/smv/definitions';
import { getConfidenceDetailData, getSmvDimensionDetailByKey } from '@/lib/smv/service';
import { SMV_DIMENSION_KEYS, SmvDimensionKey, SmvLevelDefinitionRow, SmvStageStatus } from '@/lib/smv/types';

type StageCardStatus = 'PASSED' | 'CURRENT' | 'LOCKED';

function getStageStatusBadge(status: StageCardStatus) {
  if (status === 'PASSED') {
    return { label: 'ผ่านแล้ว', className: 'border-emerald-300/40 bg-emerald-500/15 text-emerald-100' };
  }
  if (status === 'CURRENT') {
    return { label: 'ด่านปัจจุบัน', className: 'border-cyan-300/50 bg-cyan-400/20 text-cyan-100' };
  }
  return { label: 'ยังไม่ถึง', className: 'border-slate-500/40 bg-slate-700/20 text-slate-300' };
}

function getStageCardClass(status: StageCardStatus) {
  if (status === 'CURRENT') {
    return 'border-cyan-300/70 bg-cyan-500/10 shadow-[0_0_0_1px_rgba(103,232,249,0.25)]';
  }
  if (status === 'PASSED') {
    return 'border-emerald-400/35 bg-emerald-500/5';
  }
  return 'border-white/10 bg-slate-950/20 opacity-80';
}

function getLevelProgress(score: number, levelDefinitions: SmvLevelDefinitionRow[]) {
  const sortedLevels = [...levelDefinitions].sort((a, b) => a.level_score - b.level_score);
  const passedCount = sortedLevels.filter((level) => score >= level.level_score).length;
  const currentIndex = passedCount >= sortedLevels.length ? sortedLevels.length - 1 : passedCount;
  const currentLevel = sortedLevels[currentIndex] ?? null;
  const nextLevel = passedCount >= sortedLevels.length ? null : sortedLevels[passedCount] ?? null;

  return { sortedLevels, passedCount, currentIndex, currentLevel, nextLevel };
}

function getConfidenceCardStatus(status: SmvStageStatus): StageCardStatus {
  if (status === 'PASSED') return 'PASSED';
  if (status === 'IN_PROGRESS') return 'CURRENT';
  return 'LOCKED';
}

export default async function SmvDimensionPage({ params }: { params: { dimension: string } }) {
  const key = params.dimension as SmvDimensionKey;
  if (!SMV_DIMENSION_KEYS.includes(key)) notFound();

  if (key === 'confidence') {
    const confidence = await getConfidenceDetailData();
    if (!confidence) notFound();

    const nextStage = confidence.stages.find((stage) => stage.status !== 'PASSED') ?? null;
    const currentStageNumber = confidence.currentStage?.stage_number ?? confidence.totalStages;

    return (
      <main className="app-shell">
        <Navbar />
        <section className="mx-auto w-full max-w-5xl space-y-6 px-4 py-8 md:px-8">
          <Link href="/smv" className="text-sm text-cyan-200 hover:text-cyan-100">
            ← กลับไปหน้า /smv
          </Link>

          <header className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-7">
            <p className="text-sm text-slate-300">ด่านปัจจุบัน</p>
            <h1 className="mt-1 text-3xl font-semibold text-white">เชื่อมั่นในตัวเอง / เป็นผู้นำ</h1>
            <p className="mt-4 text-5xl font-semibold text-cyan-100">{confidence.score} / 100</p>
            <p className="mt-2 text-lg text-white">{confidence.currentStageLabel}</p>
            <p className="mt-1 text-sm text-slate-300">ผ่านแล้ว {confidence.passedCount} จาก {confidence.totalStages} ด่าน</p>
            <p className="mt-4 text-sm leading-relaxed text-slate-200">{confidence.summary}</p>
          </header>

          <article className="rounded-3xl border border-white/10 bg-white/5 p-5 md:p-6">
            <h2 className="text-lg font-semibold text-white">ด่านทั้งหมด</h2>
            <div className="mt-4 space-y-3">
              {confidence.stages.map((stage) => {
                const cardStatus = getConfidenceCardStatus(stage.status);
                const badge = getStageStatusBadge(cardStatus);

                return (
                  <div key={stage.id} className={`rounded-2xl border p-4 ${getStageCardClass(cardStatus)}`}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold text-white">
                        ด่าน {stage.stage_number}: {stage.title_th}
                      </p>
                      <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${badge.className}`}>{badge.label}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-200">{stage.description_th}</p>
                  </div>
                );
              })}
            </div>
          </article>

          <article className="rounded-3xl border border-white/10 bg-white/5 p-5 md:p-6">
            <h2 className="text-lg font-semibold text-white">เป้าหมายถัดไป</h2>
            <div className="mt-4 space-y-2 text-sm leading-relaxed text-slate-200">
              <p>ตอนนี้คุณอยู่ด่าน {currentStageNumber}</p>
              <p>เป้าหมายถัดไป: {nextStage ? `ผ่านด่าน ${nextStage.stage_number}` : 'รักษามาตรฐานด่านสูงสุด'}</p>
              <p>เงื่อนไข: {nextStage?.description_th ?? 'คุณผ่านครบทุกด่านแล้ว ให้รักษาความสม่ำเสมอในสถานการณ์จริง'}</p>
              <p>คำแนะนำ: {confidence.nextAction}</p>
            </div>
          </article>

          <article className="rounded-3xl border border-white/10 bg-white/5 p-5 md:p-6">
            <h2 className="text-lg font-semibold text-white">ลงมือทำต่อทันที</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href={`/smv/log?dimension=${key}`}
                className="inline-flex rounded-full bg-cyan-300 px-5 py-2 text-sm font-semibold text-slate-900 transition hover:bg-cyan-200"
              >
                เพิ่มหลักฐาน
              </Link>
              <Link
                href={`/smv/plan?dimension=${key}`}
                className="inline-flex rounded-full border border-white/20 bg-white/5 px-5 py-2 text-sm font-semibold text-white transition hover:border-cyan-200 hover:text-cyan-100"
              >
                ดูแผนพัฒนา
              </Link>
              <ConfidenceStageConfirmButton stageKey={confidence.currentStage?.stage_key ?? ''} disabled={!confidence.currentStage} />
            </div>
          </article>
        </section>
      </main>
    );
  }

  const detail = await getSmvDimensionDetailByKey(key);
  if (!detail) notFound();

  const { sortedLevels, passedCount, currentLevel, nextLevel } = getLevelProgress(detail.overview.score, detail.levelDefinitions);

  return (
    <main className="app-shell">
      <Navbar />
      <section className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8 md:px-8">
        <Link href="/smv" className="text-sm text-cyan-200 hover:text-cyan-100">
          ← กลับไปหน้า /smv
        </Link>

        <header className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-7">
          <p className="text-sm text-slate-300">ด่านปัจจุบัน</p>
          <h1 className="mt-1 text-3xl font-semibold text-white">{SMV_DIMENSION_LABELS[key] ?? detail.overview.dimension.label}</h1>
          <p className="mt-4 text-5xl font-semibold text-cyan-100">{detail.overview.score.toFixed(1)} / 100</p>
          <p className="mt-2 text-lg text-white">
            {currentLevel ? `ด่าน ${passedCount >= sortedLevels.length ? sortedLevels.length : passedCount + 1}: ${currentLevel.title}` : 'ยังไม่มีระดับด่าน'}
          </p>
          <p className="mt-4 text-sm leading-relaxed text-slate-200">{detail.overview.dimension.description ?? detail.overview.explanation}</p>
        </header>

        <article className="rounded-3xl border border-white/10 bg-white/5 p-5 md:p-6">
          <h2 className="text-lg font-semibold text-white">ด่านทั้งหมด</h2>
          <div className="mt-4 space-y-3">
            {sortedLevels.map((level, index) => {
              const cardStatus: StageCardStatus =
                index < passedCount ? 'PASSED' : index === passedCount || (passedCount >= sortedLevels.length && index === sortedLevels.length - 1) ? 'CURRENT' : 'LOCKED';
              const badge = getStageStatusBadge(cardStatus);

              return (
                <div key={level.id} className={`rounded-2xl border p-4 ${getStageCardClass(cardStatus)}`}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold text-white">
                      ด่าน {index + 1}: {level.title}
                    </p>
                    <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${badge.className}`}>{badge.label}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">คะแนนเป้าหมาย {level.level_score}</p>
                  <p className="mt-2 text-sm text-slate-200">{level.requirement_text}</p>
                </div>
              );
            })}
          </div>
        </article>

        <article className="rounded-3xl border border-white/10 bg-white/5 p-5 md:p-6">
          <h2 className="text-lg font-semibold text-white">เป้าหมายถัดไป</h2>
          <div className="mt-4 space-y-2 text-sm leading-relaxed text-slate-200">
            <p>ตอนนี้คุณอยู่ด่าน {passedCount >= sortedLevels.length ? sortedLevels.length : passedCount + 1}</p>
            <p>เป้าหมายถัดไป: {nextLevel ? `ผ่านด่าน ${passedCount + 1}` : 'รักษามาตรฐานด่านสูงสุด'}</p>
            <p>เงื่อนไข: {nextLevel?.requirement_text ?? 'คุณผ่านครบทุกด่านแล้ว ให้รักษาคะแนนและคุณภาพการลงมือทำอย่างต่อเนื่อง'}</p>
            <p>คำแนะนำ: {nextLevel ? `เร่งเก็บหลักฐานที่สะท้อนเงื่อนไขด่าน ${passedCount + 1} ให้เกิดในสถานการณ์จริง` : 'เดินหน้ารักษาคุณภาพและช่วยยกระดับด่านอื่นต่อไป'}</p>
          </div>
        </article>

        <article className="rounded-3xl border border-white/10 bg-white/5 p-5 md:p-6">
          <h2 className="text-lg font-semibold text-white">ลงมือทำต่อทันที</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href={`/smv/log?dimension=${key}`}
              className="inline-flex rounded-full bg-cyan-300 px-5 py-2 text-sm font-semibold text-slate-900 transition hover:bg-cyan-200"
            >
              เพิ่มหลักฐาน
            </Link>
            <Link
              href={`/smv/plan?dimension=${key}`}
              className="inline-flex rounded-full border border-white/20 bg-white/5 px-5 py-2 text-sm font-semibold text-white transition hover:border-cyan-200 hover:text-cyan-100"
            >
              ดูแผนพัฒนา
            </Link>
          </div>
        </article>
      </section>
    </main>
  );
}
