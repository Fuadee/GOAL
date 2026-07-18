'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { analyzeProjectFinancials, calculateActiveWorkCostAnalysis, calculateAdjustedProjectBudget } from '@/lib/financial-analysis';
import type { ConstructionProjectBudgetData } from '@/lib/money/types';
import type { ActiveWorkCostVariance } from '@/types/financial-analysis';

const thb = new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 });
const healthLabel = { strong: 'แข็งแรง', watch: 'ควรติดตาม', risk: 'มีความเสี่ยง', high_risk: 'ความเสี่ยงสูง' } as const;

export function FinancialAnalysisDialog({ data, onClose }: { data: ConstructionProjectBudgetData; onClose: () => void }) {
  const dialogRef = useRef<HTMLElement>(null);
  const [calculating, setCalculating] = useState(true);
  const analysis = useMemo(() => analyzeProjectFinancials(data), [data]);
  const activeWorkCosts = useMemo(() => calculateActiveWorkCostAnalysis(data), [data]);
  const adjustedBudget = useMemo(() => calculateAdjustedProjectBudget(data), [data]);
  const activeWorkCountLabel = `${activeWorkCosts.inProgressCount} งานกำลังทำ · ${activeWorkCosts.completedCount} งานแล้วเสร็จ`;

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const timer = window.setTimeout(() => { setCalculating(false); dialogRef.current?.focus(); }, 0);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => { window.clearTimeout(timer); document.removeEventListener('keydown', onKeyDown); document.body.style.overflow = previousOverflow; };
  }, [onClose]);

  return createPortal(<div className="fixed inset-0 z-[9999] flex h-screen w-screen items-center justify-center bg-slate-950/50 p-0 backdrop-blur-sm sm:p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="financial-analysis-title" aria-describedby="financial-analysis-description" onMouseDown={(event) => event.stopPropagation()} className="flex h-full w-full min-w-0 flex-col overflow-hidden bg-white outline-none sm:h-[calc(100vh-32px)] sm:w-[90vw] sm:max-w-[1380px] sm:rounded-[28px] sm:border sm:border-slate-200 sm:shadow-2xl">
      <header className="sticky top-0 z-10 flex shrink-0 items-start justify-between gap-4 border-b border-slate-200 bg-white px-4 py-4 sm:px-6 lg:px-8">
        <div className="min-w-0"><p className="text-[13px] font-semibold text-blue-600">Financial Analysis</p><h2 id="financial-analysis-title" className="mt-1 break-words text-xl font-semibold text-slate-950 sm:text-2xl">วิเคราะห์สถานะการเงิน</h2><p id="financial-analysis-description" className="mt-1 text-sm text-slate-600">{data.project?.name} · วิเคราะห์จากงบ หมวดงาน ความคืบหน้า และรายการใช้จ่ายจริง</p></div>
        <button type="button" onClick={onClose} aria-label="ปิดหน้าวิเคราะห์สถานะการเงิน" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-xl text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">×</button>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-4 py-5 pb-[max(20px,env(safe-area-inset-bottom))] sm:px-6 lg:px-8">
        {calculating ? <AnalysisSkeleton /> : <div className="space-y-5">
          <section className="grid min-w-0 gap-4 lg:grid-cols-[0.85fr_1.15fr]">
            <AnalysisCard title="สุขภาพการเงิน" subtitle="Financial Health">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center"><div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full border-[10px] border-blue-100 bg-blue-50"><div className="text-center"><p className="font-numeric text-3xl font-bold text-blue-700">{analysis.healthScore}</p><p className="text-xs font-medium text-blue-700">/100</p></div></div><div><p className="text-lg font-semibold text-slate-950">สถานะ: {healthLabel[analysis.healthLevel]}</p><ul className="mt-2 space-y-1.5 text-sm text-slate-700">{analysis.healthReasons.map((reason) => <li key={reason} className="flex gap-2"><span className="text-blue-600">•</span><span>{reason}</span></li>)}</ul></div></div>
            </AnalysisCard>
            <AnalysisCard title="งบประมาณปรับตามจริง" subtitle="Adjusted Project Budget">
              <p className="mb-4 text-sm leading-6 text-slate-700">นำค่าใช้จ่ายจริงของงานที่แล้วเสร็จมาแทนงบตามแผน เพื่อดูวงเงินรวมล่าสุดของโครงการ</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4"><Metric label="งบประมาณเดิม" value={thb.format(adjustedBudget.originalBudget)} /><Metric label="แผนของงานที่แล้วเสร็จ" value={thb.format(adjustedBudget.completedWorkPlannedCost)} /><Metric label="ใช้จริงของงานที่แล้วเสร็จ" value={thb.format(adjustedBudget.completedWorkActualCost)} /><Metric label="งบประมาณปรับตามจริง" value={thb.format(adjustedBudget.adjustedBudget)} tone={adjustedBudget.budgetAdjustment > 0 ? 'danger' : adjustedBudget.budgetAdjustment < 0 ? 'success' : 'default'} /></div>
              <p className="mt-4 text-sm leading-6 text-slate-700">{adjustedBudget.budgetAdjustment < 0 ? `งานที่แล้วเสร็จมีงบตามแผน ${thb.format(adjustedBudget.completedWorkPlannedCost)} และใช้จริง ${thb.format(adjustedBudget.completedWorkActualCost)} ทำให้งบรวมปรับลดลง ${thb.format(Math.abs(adjustedBudget.budgetAdjustment))}` : adjustedBudget.budgetAdjustment > 0 ? `งานที่แล้วเสร็จใช้จริงสูงกว่าแผน ${thb.format(adjustedBudget.budgetAdjustment)} ทำให้งบรวมปรับเพิ่มขึ้น ${thb.format(adjustedBudget.budgetAdjustment)}` : 'งบรวมไม่เปลี่ยนแปลง'}</p>
              {adjustedBudget.completedWithoutActualCount > 0 ? <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">มีงานที่แล้วเสร็จบางรายการยังไม่มีข้อมูลค่าใช้จ่ายจริง จึงยังคงใช้วงเงินตามแผน ({adjustedBudget.completedWithoutActualCount} งาน)</p> : null}
            </AnalysisCard>
          </section>

          <AnalysisCard title="ต้นทุนงานปัจจุบัน" subtitle="Active Work Cost Analysis">
            <div className="mb-4 space-y-1"><p className="text-sm text-slate-700">เปรียบเทียบงบที่วางไว้กับค่าใช้จ่ายจริง เฉพาะงานที่กำลังทำและงานที่แล้วเสร็จ</p><p className="text-xs font-medium text-amber-800">งานกำลังทำอาจยังมีค่าใช้จ่ายเพิ่มเติม ตัวเลขนี้เป็นสถานะ ณ ปัจจุบัน</p></div>
            {activeWorkCosts.activeWorkCount === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center text-sm font-medium text-slate-700">ยังไม่มีงานที่เริ่มดำเนินการ จึงยังไม่สามารถวิเคราะห์ต้นทุนได้</div> : <>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {activeWorkCosts.variances.map((item) => <ActiveWorkCostCard key={item.key} item={item} workCountLabel={activeWorkCountLabel} />)}
                <article className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50/70 p-4"><h4 className="font-semibold text-slate-950">ค่าใช้จ่ายอื่น</h4><p className="mt-1 break-words text-xs font-medium text-slate-600">{activeWorkCountLabel}</p><div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-white p-3 text-sm text-slate-700">ยังไม่สามารถแยกตามงานได้</div></article>
              </div>
              {activeWorkCosts.unlinkedExpenseCount > 0 ? <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">มีค่าใช้จ่าย {activeWorkCosts.unlinkedExpenseCount} รายการที่ยังไม่ได้ผูกกับงาน จึงไม่รวมในการวิเคราะห์นี้</p> : null}
            </>}
          </AnalysisCard>

        </div>}
      </div>
    </section>
  </div>, document.body);
}

function ActiveWorkCostCard({ item, workCountLabel }: { item: ActiveWorkCostVariance; workCountLabel: string }) {
  const statusLabel = item.status === 'over' ? 'เกินแผน' : item.status === 'under' ? 'ต่ำกว่าแผน' : 'ใกล้เคียงแผน';
  const statusClass = item.status === 'over' ? 'bg-rose-100 text-rose-800' : item.status === 'under' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800';
  const varianceText = item.status === 'over' ? `เกินแผน ณ ปัจจุบัน ${thb.format(Math.abs(item.variance))}` : item.status === 'under' ? `ต่ำกว่าแผน ณ ปัจจุบัน ${thb.format(Math.abs(item.variance))}` : item.variance === 0 ? 'ใกล้เคียงแผน' : `ใกล้เคียงแผน (ผลต่าง ${thb.format(Math.abs(item.variance))})`;
  const percentText = item.status === 'over' ? `เกินแผน ณ ปัจจุบัน ${Math.abs(item.variancePercent).toFixed(1)}%` : item.status === 'under' ? `ต่ำกว่าแผน ณ ปัจจุบัน ${Math.abs(item.variancePercent).toFixed(1)}%` : `ใกล้เคียงแผน ${Math.abs(item.variancePercent).toFixed(1)}%`;
  const zeroBudgetMessage = item.planned === 0 ? item.actual > 0 ? 'มีค่าใช้จ่ายที่ไม่ได้วางแผน' : 'ไม่มีงบและไม่มีค่าใช้จ่าย' : null;
  return <article className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
    <div className="flex flex-wrap items-start justify-between gap-2"><div className="min-w-0"><h4 className="font-semibold text-slate-950">{item.label}</h4><p className="mt-1 break-words text-xs font-medium text-slate-600">{workCountLabel}</p></div><span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass}`}>{statusLabel}</span></div>
    <dl className="mt-3 space-y-2 text-sm"><DataLine label="แผน" value={thb.format(item.planned)} /><DataLine label="ใช้จริง" value={thb.format(item.actual)} /><DataLine label="ผลต่าง" value={varianceText} /><DataLine label="เปอร์เซ็นต์" value={percentText} /></dl>
    {zeroBudgetMessage ? <p className="mt-3 rounded-lg bg-white px-3 py-2 text-xs font-medium text-slate-700">{zeroBudgetMessage}</p> : <div className="mt-3"><div className="flex items-center justify-between gap-2 text-xs text-slate-600"><span>ใช้จริงเทียบแผน</span><span className="font-numeric font-semibold text-slate-800">{item.utilizationPercent?.toFixed(1)}%</span></div><div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-200"><div className={`h-full rounded-full ${item.status === 'over' ? 'bg-rose-500' : 'bg-blue-600'}`} style={{ width: `${Math.min(item.utilizationPercent ?? 0, 100)}%` }} /></div></div>}
  </article>;
}
function AnalysisCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) { return <section className="min-w-0 rounded-[22px] border border-slate-200 bg-white p-4 shadow-[0_16px_38px_-34px_rgba(15,23,42,0.5)] sm:p-5"><div className="mb-4"><p className="text-xs font-semibold text-blue-600">{subtitle}</p><h3 className="mt-1 text-lg font-semibold text-slate-950">{title}</h3></div>{children}</section>; }
function Metric({ label, value, tone = 'default' }: { label: string; value: string; tone?: 'default' | 'success' | 'danger' }) { return <div className="min-w-0 rounded-xl border border-slate-200 bg-slate-50/70 p-3"><p className="text-xs text-slate-600">{label}</p><p className={`font-numeric mt-1 break-words text-base font-semibold ${tone === 'success' ? 'text-emerald-700' : tone === 'danger' ? 'text-rose-700' : 'text-slate-950'}`}>{value}</p></div>; }
function DataLine({ label, value }: { label: string; value: string }) { return <div className="flex items-start justify-between gap-2"><dt className="text-slate-600">{label}</dt><dd className="font-numeric break-words text-right font-medium text-slate-950">{value}</dd></div>; }
function AnalysisSkeleton() { return <div className="space-y-4" aria-label="กำลังวิเคราะห์ข้อมูล"><div className="grid gap-4 lg:grid-cols-2">{[0, 1].map((item) => <div key={item} className="h-64 animate-pulse rounded-[22px] bg-slate-100" />)}</div><div className="h-56 animate-pulse rounded-[22px] bg-slate-100" /><div className="grid gap-4 lg:grid-cols-2">{[0, 1].map((item) => <div key={item} className="h-72 animate-pulse rounded-[22px] bg-slate-100" />)}</div></div>; }



