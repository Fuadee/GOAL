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
    <article className="theme-card p-5">
      <h2 className="section-title">Expenses</h2>
      <p className="helper-text">Manage fixed and variable expenses.</p>
      <div className="mt-4 overflow-auto">
        <table className="theme-table">
          <thead className="text-[color:var(--text-muted)]">
            <tr>
              <th>Category</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((item) => (
              <tr key={item.id} className="text-[color:var(--text-primary)]">
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
                      className="theme-button-secondary rounded-md px-2 py-1 text-xs"
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
                      className="rounded-md border border-rose-300/35 bg-rose-500/10 px-2 py-1 text-xs text-rose-200 transition hover:bg-rose-500/20 disabled:opacity-50"
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
          className="theme-input"
        />
        <select
          name="type"
          value={expenseForm.type}
          onChange={(event) => setExpenseForm((prev) => ({ ...prev, type: event.target.value as ExpenseFormState['type'] }))}
          className="theme-input"
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
          className="theme-input"
        />
        <div className="col-span-full flex items-center gap-2">
          <button disabled={isExpensePending || isExpenseDeletePending} className="theme-button-primary w-fit disabled:opacity-50">
            {editingExpenseId ? 'Save changes' : 'Add expense'}
          </button>
          {editingExpenseId ? (
            <button
              type="button"
              disabled={isExpensePending || isExpenseDeletePending}
              onClick={clearExpenseEditor}
              className="theme-button-secondary w-fit disabled:opacity-50"
            >
              Cancel
            </button>
          ) : null}
        </div>
      </form>
      {expenseMsg ? <p className="mt-2 text-sm text-[color:var(--text-secondary)]">{expenseMsg}</p> : null}
    </article>
  );
}
