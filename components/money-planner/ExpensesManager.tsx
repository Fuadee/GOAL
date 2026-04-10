'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { createExpenseAction, deleteExpenseAction } from '@/app/money-management/actions';
import { ExpenseRow } from '@/lib/money/types';

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

type Props = { expenses: ExpenseRow[] };

type ExpenseFormState = {
  category: string;
  type: 'fixed' | 'variable';
  amount: string;
};

const defaultExpenseForm: ExpenseFormState = {
  category: '',
  type: 'fixed',
  amount: ''
};

export function ExpensesManager({ expenses }: Props) {
  const router = useRouter();
  const [isExpensePending, startExpenseTransition] = useTransition();
  const [isExpenseDeletePending, startExpenseDeleteTransition] = useTransition();
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [expenseForm, setExpenseForm] = useState<ExpenseFormState>(defaultExpenseForm);
  const [expenseMsg, setExpenseMsg] = useState<string | null>(null);

  const clearExpenseEditor = () => {
    setExpenseForm(defaultExpenseForm);
    setEditingExpenseId(null);
  };

  return (
    <article className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
      <h2 className="text-xl font-semibold text-white">Expenses</h2>
      <p className="text-sm text-slate-400">Manage fixed and variable expenses.</p>
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
            {expenses.map((item) => (
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
  );
}
