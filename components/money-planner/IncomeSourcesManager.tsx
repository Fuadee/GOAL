'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { createIncomeSourceAction, deleteIncomeSourceAction } from '@/app/money-management/actions';
import { IncomeSourceRow } from '@/lib/money/types';
import { IncomeCategory, IncomeStatus, normalizeIncomeSource } from '@/lib/money/income-utils';

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

type Props = { incomeSources: IncomeSourceRow[] };

type IncomeFormState = {
  name: string;
  type: 'active' | 'passive';
  gross_amount: string;
  direct_cost: string;
  category: IncomeCategory;
  status: IncomeStatus;
  count_in_total: boolean;
};

const defaultIncomeForm: IncomeFormState = {
  name: '', type: 'active', gross_amount: '', direct_cost: '0', category: 'current', status: 'stable', count_in_total: true
};

export function IncomeSourcesManager({ incomeSources }: Props) {
  const router = useRouter();
  const [isIncomePending, startIncomeTransition] = useTransition();
  const [isIncomeDeletePending, startIncomeDeleteTransition] = useTransition();
  const [editingIncomeSourceId, setEditingIncomeSourceId] = useState<string | null>(null);
  const [incomeForm, setIncomeForm] = useState<IncomeFormState>(defaultIncomeForm);
  const [incomeMsg, setIncomeMsg] = useState<string | null>(null);

  const clearIncomeEditor = () => { setIncomeForm(defaultIncomeForm); setEditingIncomeSourceId(null); };

  return (
    <article className="theme-card p-5">
      <h2 className="section-title">Manage income</h2>
      <p className="helper-text">Edit gross income, direct cost, and total-count settings for each source.</p>
      <div className="mt-4 overflow-auto">
        <table className="theme-table">
          <thead className="text-[color:var(--text-muted)]"><tr><th>Name</th><th>Gross</th><th>Direct cost</th><th>Net</th><th>Category</th><th>Status</th><th>Count in total</th><th>Actions</th></tr></thead>
          <tbody>
            {incomeSources.map((item) => {
              const normalized = normalizeIncomeSource(item as unknown as Record<string, unknown>);
              const gross = normalized.grossAmount;
              const cost = normalized.directCost;
              const net = normalized.netAmount;
              const category = normalized.category;
              const countInTotal = normalized.countInTotal;
              return <tr key={item.id} className="text-[color:var(--text-primary)]"><td className="py-2">{normalized.name}</td><td>{currency.format(gross)}</td><td>{currency.format(cost)}</td><td>{currency.format(net)}</td><td>{category}</td><td>{normalized.status}</td><td>{countInTotal ? 'yes' : 'no'}</td><td><div className="flex items-center gap-2"><button type="button" onClick={() => { setEditingIncomeSourceId(item.id); setIncomeForm({ name: normalized.name, type: item.type, gross_amount: String(gross), direct_cost: String(cost), category, status: normalized.status, count_in_total: countInTotal }); setIncomeMsg(null); }} className="theme-button-secondary rounded-md px-2 py-1 text-xs">Edit</button><button type="button" disabled={isIncomeDeletePending || isIncomePending} onClick={() => { if (!window.confirm('Delete this income source? This cannot be undone.')) return; setIncomeMsg(null); startIncomeDeleteTransition(async () => { const result = await deleteIncomeSourceAction(item.id); setIncomeMsg(result.message); if (result.success) { if (editingIncomeSourceId === item.id) clearIncomeEditor(); router.refresh(); } }); }} className="rounded-md border border-rose-300/35 bg-rose-500/10 px-2 py-1 text-xs text-rose-200 transition hover:bg-rose-500/20 disabled:opacity-50">Delete</button></div></td></tr>;
            })}
          </tbody>
        </table>
      </div>
      <form className="mt-4 grid gap-2 md:grid-cols-2" action={(formData) => { setIncomeMsg(null); if (editingIncomeSourceId) formData.set('id', editingIncomeSourceId); startIncomeTransition(async () => { const result = await createIncomeSourceAction(formData); setIncomeMsg(result.message); if (result.success) { clearIncomeEditor(); router.refresh(); } }); }}>
        <input name="name" placeholder="Income name" required value={incomeForm.name} onChange={(e) => setIncomeForm((p) => ({ ...p, name: e.target.value }))} className="theme-input" />
        <select name="type" value={incomeForm.type} onChange={(e) => setIncomeForm((p) => ({ ...p, type: e.target.value as IncomeFormState['type'] }))} className="theme-input"><option value="active">active</option><option value="passive">passive</option></select>
        <input name="gross_amount" type="number" min="0" step="0.01" placeholder="Gross income" required value={incomeForm.gross_amount} onChange={(e) => setIncomeForm((p) => ({ ...p, gross_amount: e.target.value }))} className="theme-input" />
        <input name="direct_cost" type="number" min="0" step="0.01" placeholder="Direct cost" value={incomeForm.direct_cost} onChange={(e) => setIncomeForm((p) => ({ ...p, direct_cost: e.target.value }))} className="theme-input" />
        <select name="category" value={incomeForm.category} onChange={(e) => setIncomeForm((p) => ({ ...p, category: e.target.value as IncomeFormState['category'] }))} className="theme-input"><option value="current">current income</option><option value="building">building income</option><option value="future">future income</option></select>
        <select name="status" value={incomeForm.status} onChange={(e) => setIncomeForm((p) => ({ ...p, status: e.target.value as IncomeFormState['status'] }))} className="theme-input"><option value="stable">stable</option><option value="unstable">unstable</option><option value="building">building</option><option value="future">future</option></select>
        <label className="col-span-full flex items-center gap-2 text-sm text-[color:var(--text-secondary)]"><input name="count_in_total" type="checkbox" checked={incomeForm.count_in_total} onChange={(e) => setIncomeForm((p) => ({ ...p, count_in_total: e.target.checked }))} />Count in total net income</label>
        <div className="col-span-full flex items-center gap-2"><button disabled={isIncomePending || isIncomeDeletePending} className="theme-button-primary w-fit disabled:opacity-50">{editingIncomeSourceId ? 'Save changes' : 'Add source'}</button>{editingIncomeSourceId ? <button type="button" disabled={isIncomePending || isIncomeDeletePending} onClick={clearIncomeEditor} className="theme-button-secondary w-fit disabled:opacity-50">Cancel</button> : null}</div>
      </form>
      {incomeMsg ? <p className="mt-2 text-sm text-[color:var(--text-secondary)]">{incomeMsg}</p> : null}
    </article>
  );
}
