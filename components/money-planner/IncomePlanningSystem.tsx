'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { createIncomeSourceAction } from '@/app/money-management/actions';
import { IncomeSourceRow, MoneyDashboardData } from '@/lib/money/types';

import { MoneySummaryDashboard } from './MoneySummaryDashboard';

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

type Props = { data: MoneyDashboardData };
type IncomeCategory = 'real' | 'growing' | 'future';
type IncomeStability = 'stable' | 'unstable' | 'building' | 'future';

type IncomeItem = {
  id: string;
  name: string;
  type: 'active' | 'passive';
  category: IncomeCategory;
  status: IncomeStability;
  frequencyLabel: string;
  grossAmount: number;
  directCost: number;
  netAmount: number;
  countInTotal: boolean;
  note: string;
};

type IncomeFormState = {
  id: string | null;
  name: string;
  type: 'active' | 'passive';
  gross_amount: string;
  direct_cost: string;
  category: IncomeCategory;
  status: IncomeStability;
  count_in_total: boolean;
  note: string;
};

const categoryMeta: Record<IncomeCategory, { title: string; description: string }> = {
  real: { title: 'Current Income', description: 'รายได้ที่รับอยู่ตอนนี้' },
  growing: { title: 'Building Income', description: 'รายได้ที่กำลังสร้างและขยาย' },
  future: { title: 'Future Income', description: 'รายได้อนาคต (ไม่นับรวมจนกว่าจะเปิดใช้งาน)' }
};

const badgeClassByStability: Record<IncomeStability, string> = {
  stable: 'border-emerald-400/30 bg-emerald-500/15 text-emerald-100',
  unstable: 'border-amber-400/30 bg-amber-500/15 text-amber-100',
  building: 'border-sky-400/30 bg-sky-500/15 text-sky-100',
  future: 'border-violet-400/30 bg-violet-500/15 text-violet-100'
};
const stabilityLabel: Record<IncomeStability, string> = { stable: 'Stable', unstable: 'Unstable', building: 'Building', future: 'Future' };

function normalizeIncome(source: IncomeSourceRow): IncomeItem {
  const category = source.category ?? 'real';
  const grossAmount = Number(source.gross_amount ?? source.expected_income ?? source.actual_income ?? 0) || 0;
  const directCost = Number(source.direct_cost ?? 0) || 0;
  const netAmount = grossAmount - directCost;
  const countInTotal = source.count_in_total ?? source.is_counted_in_real_income ?? category !== 'future';

  return {
    id: source.id,
    name: source.name,
    type: source.type,
    category,
    status: source.stability ?? (category === 'future' ? 'future' : 'stable'),
    frequencyLabel: source.frequency_label ?? '/month',
    grossAmount,
    directCost,
    netAmount: Number.isFinite(netAmount) ? netAmount : 0,
    countInTotal,
    note: source.note ?? ''
  };
}

function IncomeRealityCard({ data }: { data: MoneyDashboardData }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<IncomeFormState | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const items = data.incomeSources.map(normalizeIncome);
  const groups: Record<IncomeCategory, IncomeItem[]> = { real: [], growing: [], future: [] };
  items.forEach((item) => groups[item.category].push(item));

  const totalGrossIncome = items.filter((item) => item.countInTotal).reduce((sum, item) => sum + item.grossAmount, 0);
  const totalDirectCosts = items.filter((item) => item.countInTotal).reduce((sum, item) => sum + item.directCost, 0);
  const totalNetIncome = items.filter((item) => item.countInTotal).reduce((sum, item) => sum + item.netAmount, 0);

  return (
    <article className="premium-card flex h-full flex-col">
      <h3 className="text-lg font-semibold text-white">Where My Money Comes From</h3>
      <p className="mt-1 text-sm text-slate-400">ดูว่ารายได้แต่ละทาง เหลือเงินจริงเท่าไหร่</p>

      <div className="mt-4 grid gap-2 rounded-xl border border-white/10 bg-slate-950/50 p-4 text-sm sm:grid-cols-3">
        <div><p className="text-slate-400">Total Gross Income</p><p className="mt-1 text-base font-semibold text-slate-100">{currency.format(totalGrossIncome)}</p></div>
        <div><p className="text-slate-400">Total Direct Costs</p><p className="mt-1 text-base font-semibold text-slate-100">{currency.format(totalDirectCosts)}</p></div>
        <div><p className="text-slate-400">Total Net Income</p><p className="mt-1 text-xl font-bold text-white">{currency.format(totalNetIncome)}</p></div>
      </div>

      <div className="mt-4 space-y-4">
        {(Object.keys(categoryMeta) as IncomeCategory[]).map((category) => (
          <section key={category} className="space-y-2 rounded-xl border border-white/10 bg-slate-950/40 p-3">
            <div><p className="text-xs font-semibold tracking-[0.1em] text-slate-300">{categoryMeta[category].title}</p><p className="text-xs text-slate-500">{categoryMeta[category].description}</p></div>
            <div className="space-y-2">
              {groups[category].length === 0 ? <p className="rounded-lg border border-dashed border-white/10 px-3 py-2 text-xs text-slate-500">No sources yet</p> : groups[category].map((item) => (
                <div key={item.id} className="rounded-lg border border-white/10 bg-slate-900/70 p-3">
                  <div className="flex flex-wrap items-start justify-between gap-2"><p className="text-sm font-medium text-slate-100">{item.name}</p><div className="flex items-center gap-2"><span className={`inline-flex rounded-full border px-2 py-0.5 text-xs ${badgeClassByStability[item.status]}`}>{stabilityLabel[item.status]}</span><button type="button" className="rounded-md border border-white/15 bg-white/5 px-2 py-1 text-xs text-slate-300 transition hover:bg-white/10" onClick={() => { setForm({ id: item.id, name: item.name, type: item.type, gross_amount: String(item.grossAmount), direct_cost: String(item.directCost), category: item.category, status: item.status, count_in_total: item.countInTotal, note: item.note }); setMessage(null); }}>Edit</button></div></div>
                  <div className="mt-2 space-y-1 text-sm">
                    <p className="text-slate-300">รายรับ: {currency.format(item.grossAmount)} {item.frequencyLabel}</p>
                    <p className="text-slate-400">ต้นทุน/ดอกเบี้ย: {currency.format(item.directCost)}</p>
                    <p className="text-lg font-bold text-white">เหลือจริง: {currency.format(item.netAmount)} {item.frequencyLabel}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <Link href="/money-management/income" className="mt-5 inline-flex w-fit rounded-full border border-indigo-300/30 bg-indigo-500/10 px-4 py-2 text-sm font-semibold text-indigo-100 transition hover:bg-indigo-500/20">Manage income</Link>

      {form ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4"><div className="w-full max-w-2xl rounded-xl border border-white/10 bg-slate-900 p-4"><h4 className="text-lg font-semibold text-white">Edit income source</h4><form className="mt-3 grid gap-2 md:grid-cols-2" action={(formData) => { if (form.id) formData.set('id', form.id); setMessage(null); startTransition(async () => { const result = await createIncomeSourceAction(formData); setMessage(result.message); if (result.success) { setForm(null); router.refresh(); } }); }}>
        <input name="name" required value={form.name} onChange={(e) => setForm((prev) => prev ? { ...prev, name: e.target.value } : prev)} className="theme-input" />
        <select name="type" value={form.type} onChange={(e) => setForm((prev) => prev ? { ...prev, type: e.target.value as 'active' | 'passive' } : prev)} className="theme-input"><option value="active">active</option><option value="passive">passive</option></select>
        <input name="gross_amount" type="number" min="0" step="0.01" required value={form.gross_amount} onChange={(e) => setForm((prev) => prev ? { ...prev, gross_amount: e.target.value } : prev)} className="theme-input" />
        <input name="direct_cost" type="number" min="0" step="0.01" value={form.direct_cost} onChange={(e) => setForm((prev) => prev ? { ...prev, direct_cost: e.target.value } : prev)} className="theme-input" />
        <select name="category" value={form.category} onChange={(e) => setForm((prev) => prev ? { ...prev, category: e.target.value as IncomeCategory } : prev)} className="theme-input"><option value="real">current</option><option value="growing">building</option><option value="future">future</option></select>
        <select name="status" value={form.status} onChange={(e) => setForm((prev) => prev ? { ...prev, status: e.target.value as IncomeStability } : prev)} className="theme-input"><option value="stable">stable</option><option value="unstable">unstable</option><option value="building">building</option><option value="future">future</option></select>
        <input name="note" placeholder="Note" value={form.note} onChange={(e) => setForm((prev) => prev ? { ...prev, note: e.target.value } : prev)} className="theme-input md:col-span-2" />
        <label className="md:col-span-2 flex items-center gap-2 text-sm text-slate-300"><input name="count_in_total" type="checkbox" checked={form.count_in_total} onChange={(e) => setForm((prev) => prev ? { ...prev, count_in_total: e.target.checked } : prev)} />Count in total</label>
        <div className="md:col-span-2 flex gap-2"><button disabled={isPending} className="theme-button-primary disabled:opacity-50">Save changes</button><button type="button" onClick={() => setForm(null)} className="theme-button-secondary">Cancel</button></div>
      </form>{message ? <p className="mt-2 text-sm text-slate-300">{message}</p> : null}</div></div> : null}
    </article>
  );
}

export function IncomePlanningSystem({ data }: Props) {
  return (
    <div className="space-y-8">
      <MoneySummaryDashboard data={data} />
      <section className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Income</p>
        <IncomeRealityCard data={data} />
      </section>
    </div>
  );
}
