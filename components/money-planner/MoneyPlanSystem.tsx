'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { createMoneyGoalPlanAction, deleteMoneyGoalPlanAction } from '@/app/money-management/actions';
import { MoneyGoalPlanStatus, MoneyPlanPageData } from '@/lib/money/types';

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

type Props = { data: MoneyPlanPageData };

type PlanFormState = {
  plan_name: string;
  net_increase: string;
  status: MoneyGoalPlanStatus;
};

const defaultPlanForm: PlanFormState = {
  plan_name: '',
  net_increase: '',
  status: 'planned'
};

function SummaryCard({ label, value, tone = 'text-white' }: { label: string; value: string; tone?: string }) {
  return (
    <article className="surface-elevated p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--text-muted)]">{label}</p>
      <p className={`mt-2 text-2xl font-semibold ${tone}`}>{value}</p>
    </article>
  );
}

export function MoneyPlanSystem({ data }: Props) {
  const router = useRouter();
  const [isPlanPending, startPlanTransition] = useTransition();
  const [isDeletePending, startDeleteTransition] = useTransition();

  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [planForm, setPlanForm] = useState<PlanFormState>(defaultPlanForm);
  const [message, setMessage] = useState<string | null>(null);

  const clearEditor = () => {
    setEditingPlanId(null);
    setPlanForm(defaultPlanForm);
  };

  return (
    <div className="space-y-8">
      <section className="theme-card space-y-4 p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="page-kicker text-cyan-200/85">Plan to 100K</p>
            <h2 className="page-title mt-2 text-3xl md:text-4xl">Net Income Plan</h2>
          </div>
          <p className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface-action)] px-3 py-1 text-sm text-[color:var(--text-secondary)]">
            Target: {currency.format(data.targetIncome)}
          </p>
        </div>

        <SummaryCard label="Current Net Income" value={currency.format(data.currentNet)} tone={data.currentNet >= 0 ? 'text-cyan-300' : 'text-rose-300'} />
      </section>

      <section className="theme-card p-5">
        <h3 className="section-title">Plan List</h3>
        <p className="helper-text">Add simple plans to increase monthly net income.</p>

        <div className="mt-4 overflow-auto">
          <table className="theme-table">
            <thead className="text-[color:var(--text-muted)]">
              <tr>
                <th>Plan Name</th>
                <th>Net Increase (Monthly)</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.plans.map((plan) => (
                <tr key={plan.id} className="text-[color:var(--text-primary)]">
                  <td className="py-2">{plan.plan_name}</td>
                  <td>{currency.format(plan.net_increase)}</td>
                  <td>{plan.status}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingPlanId(plan.id);
                          setPlanForm({
                            plan_name: plan.plan_name,
                            net_increase: String(plan.net_increase),
                            status: plan.status
                          });
                          setMessage(null);
                        }}
                        className="theme-button-secondary rounded-md px-2 py-1 text-xs"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        disabled={isPlanPending || isDeletePending}
                        onClick={() => {
                          if (!window.confirm('Delete this plan? This cannot be undone.')) return;

                          setMessage(null);
                          startDeleteTransition(async () => {
                            const result = await deleteMoneyGoalPlanAction(plan.id);
                            setMessage(result.message);
                            if (result.success) {
                              if (editingPlanId === plan.id) clearEditor();
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
          className="mt-4 grid gap-2 md:grid-cols-3"
          action={(formData) => {
            setMessage(null);
            if (editingPlanId) formData.set('id', editingPlanId);

            startPlanTransition(async () => {
              const result = await createMoneyGoalPlanAction(formData);
              setMessage(result.message);
              if (result.success) {
                clearEditor();
                router.refresh();
              }
            });
          }}
        >
          <input
            name="plan_name"
            placeholder="Plan name"
            required
            value={planForm.plan_name}
            onChange={(event) => setPlanForm((prev) => ({ ...prev, plan_name: event.target.value }))}
            className="theme-input"
          />
          <input
            name="net_increase"
            type="number"
            min="0"
            step="0.01"
            placeholder="Net increase"
            required
            value={planForm.net_increase}
            onChange={(event) => setPlanForm((prev) => ({ ...prev, net_increase: event.target.value }))}
            className="theme-input"
          />
          <select
            name="status"
            value={planForm.status}
            onChange={(event) => setPlanForm((prev) => ({ ...prev, status: event.target.value as MoneyGoalPlanStatus }))}
            className="theme-input"
          >
            <option value="planned">planned</option>
            <option value="in_progress">in_progress</option>
            <option value="completed">completed</option>
          </select>
          <div className="col-span-full flex items-center gap-2">
            <button disabled={isPlanPending || isDeletePending} className="theme-button-primary w-fit disabled:opacity-50">
              {editingPlanId ? 'Save changes' : 'Add plan'}
            </button>
            {editingPlanId ? (
              <button
                type="button"
                disabled={isPlanPending || isDeletePending}
                onClick={clearEditor}
                className="theme-button-secondary w-fit disabled:opacity-50"
              >
                Cancel
              </button>
            ) : null}
          </div>
        </form>
        {message ? <p className="mt-2 text-sm text-[color:var(--text-secondary)]">{message}</p> : null}
      </section>

      <section className="theme-card p-5">
        <h3 className="section-title">Summary</h3>
        <p className="helper-text">System-calculated projection toward 100K target.</p>

        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCard label="Current Net" value={currency.format(data.currentNet)} tone={data.currentNet >= 0 ? 'text-cyan-300' : 'text-rose-300'} />
          <SummaryCard label="Planned Increase" value={currency.format(data.plannedIncrease)} tone="text-emerald-300" />
          <SummaryCard label="Projected Net" value={currency.format(data.projectedNet)} tone="text-indigo-300" />
          <SummaryCard label="Remaining Gap" value={currency.format(data.remainingGap)} tone="text-rose-300" />
        </div>
      </section>
    </div>
  );
}
