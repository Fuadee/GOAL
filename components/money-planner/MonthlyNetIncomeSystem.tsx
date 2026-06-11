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

const statusLabel: Record<NormalizedIncomeSource['status'], string> = {
  stable: 'มั่นคง',
  unstable: 'ไม่แน่นอน',
  building: 'กำลังสร้าง'
};

const getIncomeIcon = (item: NormalizedIncomeSource) => {
  const text = `${item.name} ${item.note ?? ''}`.toLowerCase();
  if (text.includes('rent') || text.includes('house') || text.includes('home') || text.includes('เช่า') || text.includes('บ้าน')) return '🏠';
  if (text.includes('solar') || text.includes('business') || text.includes('ธุรกิจ') || text.includes('โซลาร์')) return '☀️';
  if (text.includes('content') || text.includes('app') || text.includes('youtube') || text.includes('creator')) return '🚀';
  return '💼';
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

  const IncomeCard = ({ item }: { item: NormalizedIncomeSource }) => (
    <article className="group rounded-[22px] border border-white/10 bg-slate-900/70 p-5 shadow-[0_10px_32px_rgba(2,8,20,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-200/30 hover:bg-slate-900/80">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-xl">{getIncomeIcon(item)}</span>
          <div>
            <p className="font-semibold text-slate-100">{item.name}</p>
            <span className="mt-1 inline-flex rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-slate-300">
              {statusLabel[item.status]}
            </span>
          </div>
        </div>
        <button type="button" className="rounded-lg px-2.5 py-1.5 text-sm text-slate-400 transition hover:bg-white/5 hover:text-slate-100" onClick={() => openEdit(item)}>
          แก้ไข
        </button>
      </div>

      <div className="mt-5">
        <p className="text-sm text-slate-400">เหลือจริง</p>
        <p className="mt-1 text-3xl font-bold text-emerald-300 sm:text-[2rem]">{thb.format(item.netAmount)}</p>
      </div>

      <div className="mt-4 space-y-1.5 text-sm">
        <p className="text-slate-400">รายรับ <span className="text-slate-300">{thb.format(item.grossAmount)}</span></p>
        <p className="text-slate-500">{item.costLabel} <span className="text-slate-400">{thb.format(item.directCost)}</span></p>
      </div>
    </article>
  );

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[28px] border border-cyan-200/10 bg-gradient-to-br from-slate-900 via-slate-900 to-[#10233e] p-6 shadow-[0_20px_50px_rgba(2,8,20,0.48)] sm:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(52,211,153,0.12),transparent_45%),radial-gradient(circle_at_top_left,rgba(56,189,248,0.12),transparent_40%)]" />
        <div className="relative">
          <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400">รายได้สุทธิต่อเดือน</p>
          <p className="mt-3 text-5xl font-bold leading-none text-emerald-300 sm:text-6xl">{thb.format(totals.net)}</p>
          <p className="mt-3 text-sm text-slate-300">รายได้สุทธิที่เกิดขึ้นจริงต่อเดือน</p>
          <div className="mt-5 flex flex-wrap gap-2.5">
            <span className="rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs text-slate-200">รายรับรวม {thb.format(totals.gross)}</span>
            <span className="rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs text-slate-200">ต้นทุน {thb.format(totals.cost)}</span>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-100">แหล่งรายได้</h2>
            <p className="mt-1 text-sm text-slate-400">แต่ละทางเหลือเงินจริงเท่าไหร่</p>
          </div>
          <button type="button" onClick={() => setForm(emptyForm)} className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-cyan-300 to-emerald-300 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_12px_30px_rgba(20,184,166,0.25)] transition hover:brightness-105">
            + Add income
          </button>
        </div>

        {activeItems.length > 0 ? (
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-200">รายได้หลัก</h3>
              <p className="text-sm text-slate-500">รายได้ที่เกิดขึ้นจริงตอนนี้</p>
            </div>
            <div className="space-y-3">{activeItems.map((item) => <IncomeCard key={item.id} item={item} />)}</div>
          </div>
        ) : null}

        {buildingItems.length > 0 ? (
          <div className="space-y-3 pt-2">
            <div>
              <h3 className="text-sm font-semibold text-slate-200">รายได้ที่กำลังสร้าง</h3>
              <p className="text-sm text-slate-500">กำลังสร้าง ยังไม่นับในยอดรวม</p>
            </div>
            <div className="space-y-3">{buildingItems.map((item) => <IncomeCard key={item.id} item={item} />)}</div>
          </div>
        ) : null}

        {!activeItems.length && !buildingItems.length ? (
          <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-5 text-sm text-slate-400">ยังไม่มีแหล่งรายได้ ลองเพิ่มรายการแรกเพื่อเริ่มติดตามเงินจริงต่อเดือน</div>
        ) : null}
      </section>

      {form ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-xl rounded-xl border border-white/10 bg-slate-900 p-4">
            <h3 className="text-lg font-semibold text-white">{form.id ? 'แก้ไขแหล่งรายได้' : 'เพิ่มแหล่งรายได้'}</h3>
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
              <input className="theme-input" placeholder="รายรับรวม income" type="number" value={form.grossAmount} onChange={(e) => setForm({ ...form, grossAmount: e.target.value })} />
              <input className="theme-input" placeholder="Direct cost" type="number" value={form.directCost} onChange={(e) => setForm({ ...form, directCost: e.target.value })} />
              <input className="theme-input" placeholder="Cost label" value={form.costLabel} onChange={(e) => setForm({ ...form, costLabel: e.target.value })} />
              <select className="theme-input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as 'active' | 'building' })}><option value="active">รายได้หลัก</option><option value="building">รายได้ที่กำลังสร้าง</option></select>
              <select className="theme-input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as 'stable' | 'unstable' | 'building' })}><option value="stable">มั่นคง</option><option value="unstable">ไม่แน่นอน</option><option value="building">กำลังสร้าง</option></select>
              <textarea className="theme-input" placeholder="Note" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
              <div className="flex gap-2">
                <button className="theme-button-primary" disabled={isPending}>{form.id ? 'บันทึก' : 'สร้าง'}</button>
                <button type="button" className="theme-button-secondary" onClick={() => setForm(null)}>ยกเลิก</button>
              </div>
            </form>
            {message ? <p className="mt-2 text-sm text-slate-300">{message}</p> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
