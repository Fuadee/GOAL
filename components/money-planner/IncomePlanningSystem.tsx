import Link from 'next/link';

import { MoneyDashboardData } from '@/lib/money/types';

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

type Props = { data: MoneyDashboardData };

function SummaryCard({ label, value, tone = 'text-white' }: { label: string; value: string; tone?: string }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className={`mt-2 text-2xl font-semibold ${tone}`}>{value}</p>
    </article>
  );
}

function DashboardNavCard({
  title,
  description,
  stats,
  href,
  cta
}: {
  title: string;
  description: string;
  stats: Array<{ label: string; value: string }>;
  href: string;
  cta: string;
}) {
  return (
    <article className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-xl shadow-black/20">
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      <p className="mt-1 text-sm text-slate-400">{description}</p>

      <div className="mt-5 space-y-2 rounded-2xl border border-white/10 bg-slate-950/60 p-4">
        {stats.map((stat) => (
          <div key={stat.label} className="flex items-center justify-between text-sm">
            <span className="text-slate-400">{stat.label}</span>
            <span className="font-medium text-slate-100">{stat.value}</span>
          </div>
        ))}
      </div>

      <Link
        href={href}
        className="mt-6 inline-flex rounded-full bg-indigo-500/20 px-4 py-2 text-sm font-semibold text-indigo-100 transition hover:bg-indigo-500/30"
      >
        {cta}
      </Link>
    </article>
  );
}

export function IncomePlanningSystem({ data }: Props) {
  const progress = Math.max(0, Math.min(data.progressPercent, 100));

  return (
    <div className="space-y-8">
      <section className="space-y-4 rounded-3xl border border-indigo-300/20 bg-slate-900/80 p-6 shadow-2xl shadow-black/30">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-200/70">Summary Dashboard</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">Income Planning System</h2>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/money-management/plan"
              className="rounded-full border border-cyan-300/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-200 hover:bg-cyan-500/20"
            >
              Plan to 100K
            </Link>
            <p className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-sm text-slate-200">
              Net progress: {data.progressPercent.toFixed(1)}%
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <SummaryCard label="Target Net Income" value={currency.format(data.targetIncome)} />
          <SummaryCard label="Gross Income" value={currency.format(data.grossIncome)} tone="text-emerald-300" />
          <SummaryCard label="Total Expense" value={currency.format(data.totalExpense)} tone="text-amber-300" />
          <SummaryCard label="Net Income" value={currency.format(data.netIncome)} tone={data.netIncome >= 0 ? 'text-cyan-300' : 'text-rose-300'} />
          <SummaryCard label="Remaining Gap" value={currency.format(data.gap)} tone="text-rose-300" />
        </div>

        <div className="space-y-2">
          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-800">
            <div className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-cyan-300" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-sm text-slate-300">Progress is based on net income after expenses.</p>
          <p className={`text-sm ${data.netIncome <= 0 ? 'text-rose-300' : 'text-slate-300'}`}>
            You still need <span className="font-semibold text-rose-300">{currency.format(data.gap)}</span> net income to reach the {currency.format(data.targetIncome)} goal.
            {data.netIncome <= 0 ? ' Expenses currently outweigh your income and are pushing you farther from the goal.' : ''}
          </p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <DashboardNavCard
          title="Income Sources"
          description="Track active and passive income streams"
          stats={[
            { label: 'Income sources', value: String(data.incomeSummary.count) },
            { label: 'Expected income', value: currency.format(data.incomeSummary.totalExpected) },
            { label: 'Actual income', value: currency.format(data.incomeSummary.totalActual) }
          ]}
          href="/money-management/income"
          cta="Manage income"
        />

        <DashboardNavCard
          title="Expenses"
          description="Track fixed and variable costs"
          stats={[
            { label: 'Expense items', value: String(data.expenseSummary.count) },
            { label: 'Total expenses', value: currency.format(data.expenseSummary.totalAmount) }
          ]}
          href="/money-management/expenses"
          cta="Manage expenses"
        />
      </section>
    </div>
  );
}
