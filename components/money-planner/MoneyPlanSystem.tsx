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
    <article className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</p>
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
      <section className="space-y-4 rounded-3xl border border-indigo-300/20 bg-slate-900/80 p-6 shadow-2xl shadow-black/30">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-200/70">Plan to 100K</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">Net Income Plan</h2>
          </div>
          <p className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-sm text-slate-200">Target: {currency.format(data.targetIncome)}</p>
        </div>

        <SummaryCard label="Current Net Income" value={currency.format(data.currentNet)} tone={data.currentNet >= 0 ? 'text-cyan-300' : 'text-rose-300'} />
      </section>

      <section className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
        <h3 className="text-xl font-semibold text-white">Plan List</h3>
        <p className="text-sm text-slate-400">Add simple plans to increase monthly net income.</p>

        <div className="mt-4 overflow-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-slate-400">
              <tr>
                <th>Plan Name</th>
                <th>Net Increase (Monthly)</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.plans.map((plan) => (
                <tr key={plan.id} className="border-t border-white/10 text-slate-200">
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
                        className="rounded-md border border-white/15 px-2 py-1 text-xs text-slate-200 hover:bg-white/10"
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
            className="rounded-lg border border-white/15 bg-slate-950 px-3 py-2 text-white"
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
            className="rounded-lg border border-white/15 bg-slate-950 px-3 py-2 text-white"
          />
          <select
            name="status"
            value={planForm.status}
            onChange={(event) => setPlanForm((prev) => ({ ...prev, status: event.target.value as MoneyGoalPlanStatus }))}
            className="rounded-lg border border-white/15 bg-slate-950 px-3 py-2 text-white"
          >
            <option value="planned">planned</option>
            <option value="in_progress">in_progress</option>
            <option value="completed">completed</option>
          </select>
          <div className="col-span-full flex items-center gap-2">
            <button disabled={isPlanPending || isDeletePending} className="w-fit rounded-full bg-indigo-500/20 px-4 py-2 text-indigo-200 disabled:opacity-50">
              {editingPlanId ? 'Save changes' : 'Add plan'}
            </button>
            {editingPlanId ? (
              <button
                type="button"
                disabled={isPlanPending || isDeletePending}
                onClick={clearEditor}
                className="w-fit rounded-full border border-white/20 px-4 py-2 text-slate-200 disabled:opacity-50"
              >
                Cancel
              </button>
            ) : null}
          </div>
        </form>
        {message ? <p className="mt-2 text-sm text-slate-300">{message}</p> : null}
      </section>

      <section className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
        <h3 className="text-xl font-semibold text-white">Summary</h3>
        <p className="text-sm text-slate-400">System-calculated projection toward 100K target.</p>

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
