'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { createIncomeSourceAction } from '@/app/money-management/actions';
import { IncomeSourceRow } from '@/lib/money/types';
import { normalizeIncomeSource, NormalizedIncomeSource } from '@/lib/money/income-utils';

const thb = new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 });

type Props = { incomeSources: IncomeSourceRow[] };

type FormState = {
  id: string | null;
  name: string;
  grossAmount: string;
  directCost: string;
  costLabel: string;
  category: 'active' | 'building';
  status: 'stable' | 'unstable' | 'building';
  note: string;
};

const emptyForm: FormState = {
  id: null,
  name: '',
  grossAmount: '0',
  directCost: '0',
  costLabel: 'ต้นทุน/ดอกเบี้ย',
  category: 'active',
  status: 'stable',
  note: ''
};

export function MonthlyNetIncomeSystem({ incomeSources }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<FormState | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const items = useMemo(() => incomeSources.map((s) => normalizeIncomeSource(s as unknown as Record<string, unknown>)), [incomeSources]);
  const activeItems = items.filter((item) => item.category === 'active');
  const buildingItems = items.filter((item) => item.category === 'building');

  const totals = activeItems.reduce(
    (acc, item) => ({
      gross: acc.gross + item.grossAmount,
      cost: acc.cost + item.directCost,
      net: acc.net + item.netAmount
    }),
    { gross: 0, cost: 0, net: 0 }
  );

  const openEdit = (item: NormalizedIncomeSource) => {
    setMessage(null);
    setForm({
      id: item.id,
      name: item.name,
      grossAmount: String(item.grossAmount),
      directCost: String(item.directCost),
      costLabel: item.costLabel,
      category: item.category,
      status: item.status,
      note: item.note ?? ''
    });
  };

  const IncomeRow = ({ item }: { item: NormalizedIncomeSource }) => (
    <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="font-semibold text-white">{item.name}</p>
        <span className="rounded-full border border-white/15 px-2 py-0.5 text-xs text-slate-200">{item.status}</span>
      </div>
      <p className="mt-2 text-sm text-slate-300">รายรับ {thb.format(item.grossAmount)}</p>
      <p className="text-sm text-slate-400">{item.costLabel} {thb.format(item.directCost)}</p>
      <p className="mt-2 text-xl font-bold text-emerald-300">เหลือจริง {thb.format(item.netAmount)} /month</p>
      <button type="button" className="mt-3 rounded-lg border border-white/20 px-3 py-1.5 text-sm text-slate-100" onClick={() => openEdit(item)}>
        Edit
      </button>
    </div>
  );

  return (
    <div className="space-y-5">
      <section className="theme-card p-5">
        <p className="text-xs tracking-[0.2em] text-slate-400">CURRENT MONTHLY NET INCOME</p>
        <p className="mt-2 text-4xl font-bold text-white">{thb.format(totals.net)}</p>
        <p className="mt-1 text-sm text-slate-400">รวมเฉพาะรายได้ที่เกิดขึ้นจริงตอนนี้</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-white/10 bg-slate-950/50 p-3"><p className="text-xs text-slate-400">Total Gross Income</p><p className="text-lg font-semibold text-slate-100">{thb.format(totals.gross)}</p></div>
          <div className="rounded-lg border border-white/10 bg-slate-950/50 p-3"><p className="text-xs text-slate-400">Total Direct Costs</p><p className="text-lg font-semibold text-slate-100">{thb.format(totals.cost)}</p></div>
        </div>
      </section>

      <div className="flex justify-end">
        <button type="button" onClick={() => setForm(emptyForm)} className="theme-button-primary">Add income source</button>
      </div>

      <section className="theme-card p-5 space-y-3">
        <h2 className="section-title">Active Income</h2>
        <p className="helper-text">รายได้ที่เกิดขึ้นจริงตอนนี้</p>
        <div className="space-y-3">{activeItems.length ? activeItems.map((item) => <IncomeRow key={item.id} item={item} />) : <p className="text-slate-500">No active income yet</p>}</div>
      </section>

      <section className="theme-card p-5 space-y-3">
        <h2 className="section-title">Building Income</h2>
        <p className="helper-text">กำลังสร้าง ยังไม่นับเป็นรายได้ตอนนี้</p>
        <div className="space-y-3">{buildingItems.length ? buildingItems.map((item) => <IncomeRow key={item.id} item={item} />) : <p className="text-slate-500">No building income yet</p>}</div>
      </section>

      {form ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-xl rounded-xl border border-white/10 bg-slate-900 p-4">
            <h3 className="text-lg font-semibold text-white">{form.id ? 'Edit income source' : 'Add income source'}</h3>
            <form className="mt-3 grid gap-2" action={(fd) => {
              if (form.id) fd.set('id', form.id);
              fd.set('name', form.name);
              fd.set('gross_amount', form.grossAmount);
              fd.set('direct_cost', form.directCost);
              fd.set('cost_label', form.costLabel);
              fd.set('category', form.category);
              fd.set('status', form.status);
              fd.set('note', form.note);
              startTransition(async () => {
                const result = await createIncomeSourceAction(fd);
                setMessage(result.message);
                if (result.success) {
                  setForm(null);
                  router.refresh();
                }
              });
            }}>
              <input className="theme-input" placeholder="Income name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <input className="theme-input" placeholder="Gross income" type="number" value={form.grossAmount} onChange={(e) => setForm({ ...form, grossAmount: e.target.value })} />
              <input className="theme-input" placeholder="Direct cost" type="number" value={form.directCost} onChange={(e) => setForm({ ...form, directCost: e.target.value })} />
              <input className="theme-input" placeholder="Cost label" value={form.costLabel} onChange={(e) => setForm({ ...form, costLabel: e.target.value })} />
              <select className="theme-input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as 'active' | 'building' })}><option value="active">Active Income</option><option value="building">Building Income</option></select>
              <select className="theme-input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as 'stable' | 'unstable' | 'building' })}><option value="stable">Stable</option><option value="unstable">Unstable</option><option value="building">Building</option></select>
              <textarea className="theme-input" placeholder="Note" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
              <div className="flex gap-2">
                <button className="theme-button-primary" disabled={isPending}>{form.id ? 'Save' : 'Create'}</button>
                <button type="button" className="theme-button-secondary" onClick={() => setForm(null)}>Cancel</button>
              </div>
            </form>
            {message ? <p className="mt-2 text-sm text-slate-300">{message}</p> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
