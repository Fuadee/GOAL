import { notFound } from 'next/navigation';

import { InnovationProcessSection } from '@/components/innovation/InnovationProcessSection';
import { Navbar } from '@/components/navbar';
import { getInnovationDetailData } from '@/lib/innovation/service';
import {
  getCurrentMissionFocus,
  getStepStatusSummary,
  getInnovationStateMeta,
  getMissionProgress
} from '@/lib/innovation/helpers';

type InnovationDetailPageProps = {
  params: { id: string };
};

function formatTimestamp(value: string): string {
  return new Intl.DateTimeFormat('th-TH-u-ca-buddhist', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

export default async function InnovationDetailPage({ params }: InnovationDetailPageProps) {
  const data = await getInnovationDetailData(params.id);
  if (!data) notFound();

  const { innovation, steps, completedStepCount, progressPercent } = data;
  const mission = { ...innovation, stepTotal: steps.length, completedStepCount, progressPercent, steps, nextStep: null };
  const stateMeta = getInnovationStateMeta(mission);
  const { stepTotal } = getMissionProgress(mission);
  const summary = getStepStatusSummary(mission);

  return (
    <main className="min-h-screen bg-slate-100/70">
      <Navbar />
      <section className="page-container mx-auto w-full max-w-5xl space-y-5 px-4 py-5 sm:space-y-6 md:py-6">
        <section className="space-y-3 rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-[0_20px_45px_-30px_rgba(15,23,42,0.28)] sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">ภาพรวมภารกิจ</p>
          <h1 className="text-2xl font-semibold text-slate-950 md:text-3xl">{innovation.title}</h1>
          <p className="text-sm text-slate-700">{innovation.description || 'ยังไม่มีรายละเอียด'}</p>
          <p className="text-sm text-slate-700">เป้าหมาย: {innovation.goal || 'ยังไม่มีเป้าหมาย'}</p>
          <div className="grid gap-2 text-sm text-slate-700 md:grid-cols-2">
            <p>สถานะ: <span className="font-semibold text-slate-900">{stateMeta.label}</span></p>
            <p>ความคืบหน้า: <span className="font-semibold text-slate-900">{progressPercent}%</span> ({completedStepCount}/{stepTotal})</p>
            <p>กำลังทำ: <span className="font-semibold text-cyan-700">{summary.active}</span> · ติดขัด: <span className="font-semibold text-rose-700">{summary.blocked}</span> · รออยู่: <span className="font-semibold text-amber-700">{summary.waiting}</span> · เสร็จแล้ว: <span className="font-semibold text-emerald-700">{summary.done}/{summary.total}</span></p>
            <p>อัปเดตล่าสุด: <span className="text-slate-900">{formatTimestamp(innovation.updated_at)}</span></p>
          </div>
        </section>

        <InnovationProcessSection
          innovationId={innovation.id}
          currentFocus={getCurrentMissionFocus(mission)}
          steps={steps}
        />

      </section>
    </main>
  );
}
