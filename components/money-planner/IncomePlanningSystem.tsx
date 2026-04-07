'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import {
  createExpenseAction,
  createIncomeSourceAction,
  createRentalHouseAction,
  deleteExpenseAction,
  deleteIncomeSourceAction
} from '@/app/money-management/actions';
import { MoneyDashboardData } from '@/lib/money/types';

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

type Props = { data: MoneyDashboardData };

type IncomeFormState = {
  name: string;
  type: 'active' | 'passive';
  expected_income: string;
  actual_income: string;
};

type ExpenseFormState = {
  category: string;
  type: 'fixed' | 'variable';
  amount: string;
};

const defaultIncomeForm: IncomeFormState = {
  name: '',
  type: 'active',
  expected_income: '',
  actual_income: ''
};

const defaultExpenseForm: ExpenseFormState = {
  category: '',
  type: 'fixed',
  amount: ''
};

function SummaryCard({ label, value, tone = 'text-white' }: { label: string; value: string; tone?: string }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className={`mt-2 text-2xl font-semibold ${tone}`}>{value}</p>
    </article>
  );
}

export function IncomePlanningSystem({ data }: Props) {
  const router = useRouter();
  const [isIncomePending, startIncomeTransition] = useTransition();
  const [isExpensePending, startExpenseTransition] = useTransition();
  const [isRentalPending, startRentalTransition] = useTransition();
  const [isIncomeDeletePending, startIncomeDeleteTransition] = useTransition();
  const [isExpenseDeletePending, startExpenseDeleteTransition] = useTransition();

  const [editingIncomeSourceId, setEditingIncomeSourceId] = useState<string | null>(null);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);

  const [incomeForm, setIncomeForm] = useState<IncomeFormState>(defaultIncomeForm);
  const [expenseForm, setExpenseForm] = useState<ExpenseFormState>(defaultExpenseForm);

  const [incomeMsg, setIncomeMsg] = useState<string | null>(null);
  const [expenseMsg, setExpenseMsg] = useState<string | null>(null);
  const [rentalMsg, setRentalMsg] = useState<string | null>(null);

  const progress = Math.max(0, Math.min(data.progressPercent, 100));

  const clearIncomeEditor = () => {
    setIncomeForm(defaultIncomeForm);
    setEditingIncomeSourceId(null);
  };

  const clearExpenseEditor = () => {
    setExpenseForm(defaultExpenseForm);
    setEditingExpenseId(null);
  };

  return (
    <div className="space-y-8">
      <section className="space-y-4 rounded-3xl border border-indigo-300/20 bg-slate-900/80 p-6 shadow-2xl shadow-black/30">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-200/70">Summary Dashboard</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">Income Planning System</h2>
          </div>
          <p className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-sm text-slate-200">
            Progress: {data.progressPercent.toFixed(1)}%
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <SummaryCard label="Target Income" value={currency.format(data.targetIncome)} />
          <SummaryCard label="Total Income" value={currency.format(data.totalIncome)} tone="text-emerald-300" />
          <SummaryCard label="Total Expense" value={currency.format(data.totalExpense)} tone="text-amber-300" />
          <SummaryCard label="Net Income" value={currency.format(data.netIncome)} tone={data.netIncome >= 0 ? 'text-cyan-300' : 'text-rose-300'} />
          <SummaryCard label="Gap" value={currency.format(data.gap)} tone="text-rose-300" />
        </div>

        <div className="space-y-2">
          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-800">
            <div className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-cyan-300" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-sm text-slate-300">
            Gap analysis: <span className="font-semibold text-rose-300">{currency.format(data.gap)}</span> needed to hit the {currency.format(data.targetIncome)} target.
          </p>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
          <h3 className="text-xl font-semibold text-white">Income Sources</h3>
          <p className="text-sm text-slate-400">Track active and passive income streams.</p>
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
                {data.incomeSources.map((item) => (
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

        <article className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
          <h3 className="text-xl font-semibold text-white">Expenses</h3>
          <p className="text-sm text-slate-400">Track fixed and variable costs.</p>
          <div className="mt-4 overflow-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-slate-400">
                <tr>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.expenses.map((item) => (
                  <tr key={item.id} className="border-t border-white/10 text-slate-200">
                    <td className="py-2">{item.category}</td>
                    <td>{item.type}</td>
                    <td>{currency.format(item.amount)}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingExpenseId(item.id);
                            setExpenseForm({
                              category: item.category,
                              type: item.type,
                              amount: String(item.amount)
                            });
                            setExpenseMsg(null);
                          }}
                          className="rounded-md border border-white/15 px-2 py-1 text-xs text-slate-200 hover:bg-white/10"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          disabled={isExpenseDeletePending || isExpensePending}
                          onClick={() => {
                            if (!window.confirm('Delete this expense? This cannot be undone.')) return;

                            setExpenseMsg(null);
                            startExpenseDeleteTransition(async () => {
                              const result = await deleteExpenseAction(item.id);
                              setExpenseMsg(result.message);
                              if (result.success) {
                                if (editingExpenseId === item.id) clearExpenseEditor();
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
              setExpenseMsg(null);
              if (editingExpenseId) formData.set('id', editingExpenseId);

              startExpenseTransition(async () => {
                const result = await createExpenseAction(formData);
                setExpenseMsg(result.message);
                if (result.success) {
                  clearExpenseEditor();
                  router.refresh();
                }
              });
            }}
          >
            <input
              name="category"
              placeholder="Category"
              required
              value={expenseForm.category}
              onChange={(event) => setExpenseForm((prev) => ({ ...prev, category: event.target.value }))}
              className="rounded-lg border border-white/15 bg-slate-950 px-3 py-2 text-white"
            />
            <select
              name="type"
              value={expenseForm.type}
              onChange={(event) => setExpenseForm((prev) => ({ ...prev, type: event.target.value as ExpenseFormState['type'] }))}
              className="rounded-lg border border-white/15 bg-slate-950 px-3 py-2 text-white"
            >
              <option value="fixed">fixed</option>
              <option value="variable">variable</option>
            </select>
            <input
              name="amount"
              type="number"
              min="0"
              step="0.01"
              placeholder="Amount"
              required
              value={expenseForm.amount}
              onChange={(event) => setExpenseForm((prev) => ({ ...prev, amount: event.target.value }))}
              className="rounded-lg border border-white/15 bg-slate-950 px-3 py-2 text-white"
            />
            <div className="col-span-full flex items-center gap-2">
              <button disabled={isExpensePending || isExpenseDeletePending} className="w-fit rounded-full bg-indigo-500/20 px-4 py-2 text-indigo-200 disabled:opacity-50">
                {editingExpenseId ? 'Save changes' : 'Add expense'}
              </button>
              {editingExpenseId ? (
                <button
                  type="button"
                  disabled={isExpensePending || isExpenseDeletePending}
                  onClick={clearExpenseEditor}
                  className="w-fit rounded-full border border-white/20 px-4 py-2 text-slate-200 disabled:opacity-50"
                >
                  Cancel
                </button>
              ) : null}
            </div>
          </form>
          {expenseMsg ? <p className="mt-2 text-sm text-slate-300">{expenseMsg}</p> : null}
        </article>
      </section>

      <article className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
        <h3 className="text-xl font-semibold text-white">Rental House Plan</h3>
        <p className="text-sm text-slate-400">Build a rental portfolio for passive income growth.</p>
        <div className="mt-4 overflow-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-slate-400"><tr><th>Name</th><th>Status</th><th>Monthly Income</th></tr></thead>
            <tbody>
              {data.rentalHouses.map((item) => (
                <tr key={item.id} className="border-t border-white/10 text-slate-200"><td className="py-2">{item.name}</td><td>{item.status}</td><td>{currency.format(item.monthly_income)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <form
          className="mt-4 grid gap-2 md:grid-cols-3"
          action={(formData) => {
            setRentalMsg(null);
            startRentalTransition(async () => {
              const result = await createRentalHouseAction(formData);
              setRentalMsg(result.message);
              if (result.success) router.refresh();
            });
          }}
        >
          <input name="name" placeholder="House name" required className="rounded-lg border border-white/15 bg-slate-950 px-3 py-2 text-white" />
          <select name="status" defaultValue="planning" className="rounded-lg border border-white/15 bg-slate-950 px-3 py-2 text-white"><option value="planning">planning</option><option value="building">building</option><option value="active">active</option></select>
          <input name="monthly_income" type="number" min="0" step="0.01" placeholder="Monthly income" required className="rounded-lg border border-white/15 bg-slate-950 px-3 py-2 text-white" />
          <button disabled={isRentalPending} className="w-fit rounded-full bg-indigo-500/20 px-4 py-2 text-indigo-200 disabled:opacity-50">Add rental</button>
        </form>
        {rentalMsg ? <p className="mt-2 text-sm text-slate-300">{rentalMsg}</p> : null}
      </article>
    </div>
  );
}
