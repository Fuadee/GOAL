'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { createIncomeSourceAction, deleteIncomeSourceAction } from '@/app/money-management/actions';
import { IncomeSourceRow } from '@/lib/money/types';

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

type Props = { incomeSources: IncomeSourceRow[] };

type IncomeFormState = {
  name: string;
  type: 'active' | 'passive';
  expected_income: string;
  actual_income: string;
};

const defaultIncomeForm: IncomeFormState = {
  name: '',
  type: 'active',
  expected_income: '',
  actual_income: ''
};

export function IncomeSourcesManager({ incomeSources }: Props) {
  const router = useRouter();
  const [isIncomePending, startIncomeTransition] = useTransition();
  const [isIncomeDeletePending, startIncomeDeleteTransition] = useTransition();
  const [editingIncomeSourceId, setEditingIncomeSourceId] = useState<string | null>(null);
  const [incomeForm, setIncomeForm] = useState<IncomeFormState>(defaultIncomeForm);
  const [incomeMsg, setIncomeMsg] = useState<string | null>(null);

  const clearIncomeEditor = () => {
    setIncomeForm(defaultIncomeForm);
    setEditingIncomeSourceId(null);
  };

  return (
    <article className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
      <h2 className="text-xl font-semibold text-white">Income Sources</h2>
      <p className="text-sm text-slate-400">Manage all active and passive income streams.</p>
      <div className="mt-4 overflow-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-slate-400">
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Expected</th>
              <th>Actual</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {incomeSources.map((item) => (
              <tr key={item.id} className="border-t border-white/10 text-slate-200">
                <td className="py-2">{item.name}</td>
                <td>{item.type}</td>
                <td>{currency.format(item.expected_income)}</td>
                <td>{currency.format(item.actual_income)}</td>
                <td>{new Date(item.created_at).toLocaleDateString()}</td>
                <td>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingIncomeSourceId(item.id);
                        setIncomeForm({
                          name: item.name,
                          type: item.type,
                          expected_income: String(item.expected_income),
                          actual_income: String(item.actual_income)
                        });
                        setIncomeMsg(null);
                      }}
                      className="rounded-md border border-white/15 px-2 py-1 text-xs text-slate-200 hover:bg-white/10"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      disabled={isIncomeDeletePending || isIncomePending}
                      onClick={() => {
                        if (!window.confirm('Delete this income source? This cannot be undone.')) return;

                        setIncomeMsg(null);
                        startIncomeDeleteTransition(async () => {
                          const result = await deleteIncomeSourceAction(item.id);
                          setIncomeMsg(result.message);
                          if (result.success) {
                            if (editingIncomeSourceId === item.id) clearIncomeEditor();
                            router.refresh();
                          }
                        });
                      }}
                      className="rounded-md border border-rose-300/30 px-2 py-1 text-xs text-rose-200 hover:bg-rose-500/10 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <form
        className="mt-4 grid gap-2 md:grid-cols-2"
        action={(formData) => {
          setIncomeMsg(null);
          if (editingIncomeSourceId) formData.set('id', editingIncomeSourceId);

          startIncomeTransition(async () => {
            const result = await createIncomeSourceAction(formData);
            setIncomeMsg(result.message);
            if (result.success) {
              clearIncomeEditor();
              router.refresh();
            }
          });
        }}
      >
        <input
          name="name"
          placeholder="Income name"
          required
          value={incomeForm.name}
          onChange={(event) => setIncomeForm((prev) => ({ ...prev, name: event.target.value }))}
          className="rounded-lg border border-white/15 bg-slate-950 px-3 py-2 text-white"
        />
        <select
          name="type"
          value={incomeForm.type}
          onChange={(event) => setIncomeForm((prev) => ({ ...prev, type: event.target.value as IncomeFormState['type'] }))}
          className="rounded-lg border border-white/15 bg-slate-950 px-3 py-2 text-white"
        >
          <option value="active">active</option>
          <option value="passive">passive</option>
        </select>
        <input
          name="expected_income"
          type="number"
          min="0"
          step="0.01"
          placeholder="Expected income"
          required
          value={incomeForm.expected_income}
          onChange={(event) => setIncomeForm((prev) => ({ ...prev, expected_income: event.target.value }))}
          className="rounded-lg border border-white/15 bg-slate-950 px-3 py-2 text-white"
        />
        <input
          name="actual_income"
          type="number"
          min="0"
          step="0.01"
          placeholder="Actual income"
          required
          value={incomeForm.actual_income}
          onChange={(event) => setIncomeForm((prev) => ({ ...prev, actual_income: event.target.value }))}
          className="rounded-lg border border-white/15 bg-slate-950 px-3 py-2 text-white"
        />
        <div className="col-span-full flex items-center gap-2">
          <button disabled={isIncomePending || isIncomeDeletePending} className="w-fit rounded-full bg-indigo-500/20 px-4 py-2 text-indigo-200 disabled:opacity-50">
            {editingIncomeSourceId ? 'Save changes' : 'Add source'}
          </button>
          {editingIncomeSourceId ? (
            <button
              type="button"
              disabled={isIncomePending || isIncomeDeletePending}
              onClick={clearIncomeEditor}
              className="w-fit rounded-full border border-white/20 px-4 py-2 text-slate-200 disabled:opacity-50"
            >
              Cancel
            </button>
          ) : null}
        </div>
      </form>
      {incomeMsg ? <p className="mt-2 text-sm text-slate-300">{incomeMsg}</p> : null}
    </article>
  );
}
