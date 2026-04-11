import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Navbar } from '@/components/navbar';
import { StatusIncomeActions } from '@/components/smv/StatusIncomeActions';
import { SMV_DIMENSION_LABELS } from '@/lib/smv/definitions';
import { getConfidenceDetailData, getSmvDimensionDetailByKey, getStatusDetailData } from '@/lib/smv/service';
import { SMV_DIMENSION_KEYS, SmvDimensionKey, SmvLevelDefinitionRow } from '@/lib/smv/types';

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

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('th-TH').format(Math.max(0, Math.round(amount)));
}

function getLevelProgress(score: number, levelDefinitions: SmvLevelDefinitionRow[]) {
  const sortedLevels = [...levelDefinitions].sort((a, b) => a.level_score - b.level_score);
  const passedCount = sortedLevels.filter((level) => score >= level.level_score).length;
  const currentIndex = passedCount >= sortedLevels.length ? sortedLevels.length - 1 : passedCount;
  const currentLevel = sortedLevels[currentIndex] ?? null;
  const nextLevel = passedCount >= sortedLevels.length ? null : sortedLevels[passedCount] ?? null;

  return { sortedLevels, passedCount, currentIndex, currentLevel, nextLevel };
}

export default async function SmvDimensionPage({ params }: { params: { dimension: string } }) {
  const key = params.dimension as SmvDimensionKey;
  if (!SMV_DIMENSION_KEYS.includes(key)) notFound();

  if (key === 'confidence') {
    const confidence = await getConfidenceDetailData();
    if (!confidence) notFound();

    const currentLevel = confidence.currentStage;
    const remainCount = Math.max(0, confidence.currentStageProgress.required - confidence.currentStageProgress.current);

    return (
      <main className="app-shell">
        <Navbar />
        <section className="mx-auto w-full max-w-5xl space-y-6 px-4 py-8 md:px-8">
          <Link href="/smv" className="text-sm text-cyan-200 hover:text-cyan-100">
            ← กลับไปหน้า /smv
          </Link>

          <header className="rounded-3xl border border-cyan-300/40 bg-cyan-500/10 p-6 md:p-7">
            <h1 className="text-3xl font-semibold text-white">ด่านทั้งหมด</h1>
            <p className="mt-2 text-sm text-slate-200">เส้นทางฝึกความมั่นใจของหัวข้อ เชื่อมั่นในตัวเอง / เป็นผู้นำ</p>
          </header>

          <article className="rounded-3xl border border-cyan-300/40 bg-cyan-500/10 p-5 md:p-6">
            <h2 className="text-sm text-cyan-100">เป้าหมายถัดไป</h2>
            {confidence.allCompleted ? (
              <p className="mt-2 text-lg font-semibold text-white">คุณผ่านเส้นทาง Confidence ครบทั้งหมดแล้ว</p>
            ) : (
              <>
                <p className="mt-2 text-lg font-semibold text-white">
                  {currentLevel.title} ({confidence.currentStageProgress.current}/{confidence.currentStageProgress.required})
                </p>
                <p className="mt-2 text-sm text-slate-200">{currentLevel.description}</p>
                <p className="mt-2 text-sm text-cyan-100">เหลืออีก {remainCount} ครั้ง เพื่อผ่านด่านนี้</p>
              </>
            )}
          </article>

          <article className="rounded-3xl border border-white/10 bg-white/5 p-5 md:p-6">
            <div className="space-y-3">
              {confidence.stages.map((stage) => {
                const isCurrent = stage.level === currentLevel.level;
                const isPassed = stage.progress.current >= stage.progress.required && !isCurrent;
                const cardStatus: StageCardStatus = isPassed ? 'PASSED' : isCurrent ? 'CURRENT' : 'LOCKED';
                const badge = getStageStatusBadge(cardStatus);

                return (
                  <div
                    key={stage.level}
                    className={`rounded-2xl border p-4 transition ${getStageCardClass(cardStatus)} ${isCurrent ? 'scale-[1.01] shadow-[0_0_24px_rgba(34,211,238,0.25)]' : ''}`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold text-white">
                        ด่าน {stage.level}: {stage.title}
                      </p>
                      <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${badge.className}`}>{badge.label}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-200">{stage.description}</p>
                    <div className="mt-3">
                      <p className="text-sm font-medium text-cyan-100">
                        {Math.min(stage.progress.current, stage.progress.required)} / {stage.progress.required}
                      </p>
                      <div className="mt-1 h-2 w-full rounded-full bg-slate-800">
                        <div className="h-2 rounded-full bg-cyan-300 transition-all" style={{ width: `${stage.progress.percent}%` }} />
                      </div>
                    </div>
                    <div className="mt-4">
                      <Link
                        href={`/smv/log?dimension=confidence&action_type=${stage.action_type}`}
                        className="inline-flex rounded-full bg-cyan-300 px-4 py-2 text-xs font-semibold text-slate-900 transition hover:bg-cyan-200"
                      >
                        เพิ่ม action
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </article>
        </section>
      </main>
    );
  }

  if (key === 'status') {
    const statusDetail = await getStatusDetailData();
    if (!statusDetail) notFound();

    const {
      levels,
      currentLevel,
      nextLevel,
      currentLevelNumber,
      monthlyIncome,
      progressPercent,
      remainingIncome,
      nextThreshold
    } = statusDetail;

    return (
      <main className="app-shell">
        <Navbar />
        <section className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8 md:px-8">
          <Link href="/smv" className="text-sm text-cyan-200 hover:text-cyan-100">
            ← กลับไปหน้า /smv
          </Link>

          <article className="rounded-3xl border border-cyan-300/45 bg-gradient-to-br from-slate-900 via-cyan-950/30 to-slate-900 p-6 shadow-[0_0_40px_rgba(6,182,212,0.2)] md:p-8">
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/90">Income Progression System</p>
            <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm text-slate-300">ด่านปัจจุบัน</p>
                <h1 className="mt-1 text-3xl font-semibold text-white md:text-4xl">{currentLevel ? currentLevel.title : 'ก่อนเริ่มด่านแรก'}</h1>
                <p className="mt-1 text-xl font-medium text-cyan-100">{currentLevel?.english_label ?? 'Pre-Level'} </p>
              </div>
              <p className="rounded-2xl border border-cyan-300/50 bg-cyan-400/15 px-4 py-2 text-3xl font-semibold text-cyan-100">Level {currentLevelNumber}</p>
            </div>

            <p className="mt-4 text-2xl font-semibold text-white">{formatCurrency(monthlyIncome)} บาท / เดือน</p>
            <p className="mt-2 text-sm text-slate-200">{currentLevel?.identity_text ?? 'เริ่มต้นสร้างรายได้หลักของคุณให้ถึง 10,000 บาทต่อเดือน'}</p>
            <StatusIncomeActions showSecondaryLink />

            {currentLevelNumber === 0 ? (
              <div className="mt-4 rounded-2xl border border-cyan-300/30 bg-cyan-500/10 p-4">
                <p className="text-sm text-cyan-100">เริ่มต้นด้วยการกรอกรายได้ปัจจุบันของคุณ เพื่อให้ระบบคำนวณด่านแรกทันที</p>
                <StatusIncomeActions triggerLabel="เริ่มกรอกรายได้" triggerStyle="inline" compact />
              </div>
            ) : null}

            <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/40 p-4">
              <div className="flex items-center justify-between text-sm">
                <p className="text-slate-300">Progress ไปด่านถัดไป</p>
                <p className="font-semibold text-cyan-100">{progressPercent.toFixed(1)}%</p>
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-slate-800">
                <div className="h-2 rounded-full bg-gradient-to-r from-cyan-300 to-emerald-300" style={{ width: `${progressPercent}%` }} />
              </div>
              <p className="mt-3 text-sm text-cyan-100">
                {nextLevel
                  ? `อีก ${formatCurrency(remainingIncome)} บาท จะถึง ${nextLevel.english_label}`
                  : 'คุณอยู่ระดับสูงสุดแล้ว — Power Player'}
              </p>
              {nextLevel && (
                <p className="mt-1 text-xs text-slate-300">เป้าหมายรายได้ด่านถัดไป: {formatCurrency(nextThreshold ?? 0)} บาท / เดือน</p>
              )}
            </div>
          </article>

          <article className="rounded-3xl border border-white/10 bg-white/5 p-5 md:p-6">
            <h2 className="text-lg font-semibold text-white">ด่านรายได้ทั้งหมด</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {levels.map((level) => {
                const cardStatus: StageCardStatus = currentLevelNumber > level.level ? 'PASSED' : currentLevelNumber === level.level ? 'CURRENT' : 'LOCKED';
                const badge = getStageStatusBadge(cardStatus);
                const isCurrent = cardStatus === 'CURRENT';
                const isPassed = cardStatus === 'PASSED';

                return (
                  <div
                    key={level.level}
                    className={`rounded-2xl border p-5 transition ${
                      isCurrent
                        ? 'scale-[1.02] border-cyan-300/80 bg-cyan-500/10 shadow-[0_0_24px_rgba(34,211,238,0.35)]'
                        : isPassed
                          ? 'border-emerald-300/40 bg-emerald-500/10 shadow-[0_0_18px_rgba(16,185,129,0.18)]'
                          : 'border-white/10 bg-slate-950/20'
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">ด่าน {level.level}</p>
                        <p className="mt-1 text-lg font-semibold text-white">{level.title}</p>
                        <p className="text-sm text-cyan-100">{level.english_label}</p>
                      </div>
                      <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${badge.className}`}>{badge.label}</span>
                    </div>

                    <p className="mt-4 text-sm text-slate-100">{level.short_description}</p>
                    <p className="mt-1 text-sm text-slate-300">{level.identity_text}</p>
                    <p className="mt-3 text-sm font-medium text-cyan-100">รายได้ขั้นต่ำ {formatCurrency(level.income_threshold)} / เดือน</p>

                    {isCurrent && (
                      <div className="mt-4 rounded-xl border border-cyan-300/40 bg-cyan-500/10 p-3">
                        <p className="text-sm text-slate-100">รายได้ปัจจุบัน: {formatCurrency(monthlyIncome)} บาท / เดือน</p>
                        <div className="mt-2 h-2 rounded-full bg-slate-800">
                          <div className="h-2 rounded-full bg-cyan-300" style={{ width: `${progressPercent}%` }} />
                        </div>
                        <p className="mt-2 text-xs text-cyan-100">
                          {nextLevel ? `อีก ${formatCurrency(remainingIncome)} บาท ถึงด่านถัดไป` : 'คุณอยู่ระดับสูงสุดแล้ว'}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <StatusIncomeActions triggerLabel="อัปเดตรายได้" triggerStyle="inline" compact />
                          <Link
                            href="/smv/log?dimension=status"
                            className="inline-flex rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-semibold text-white transition hover:border-cyan-200 hover:text-cyan-100"
                          >
                            เพิ่มหลักฐานรายได้
                          </Link>
                        </div>
                      </div>
                    )}

                    {isPassed && <p className="mt-4 text-sm font-semibold text-emerald-200">ผ่านแล้ว</p>}

                    {!isPassed && !isCurrent && (
                      <div className="mt-4 space-y-1">
                        <p className="text-sm text-slate-300">ต้องมีรายได้ขั้นต่ำ {formatCurrency(level.income_threshold)} / เดือน</p>
                        <p className="text-xs text-cyan-200/90">อัปเดตรายได้เพื่อปลดล็อก</p>
                      </div>
                    )}
                  </div>
                );
              })}
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
