import Link from 'next/link';

import { MoneyDashboardData } from '@/lib/money/types';

import { MoneySummaryDashboard } from './MoneySummaryDashboard';

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

type Props = { data: MoneyDashboardData };

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
    <article className="rounded-2xl border border-white/10 bg-slate-900/55 p-5 shadow-lg shadow-black/10">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-1 text-sm text-slate-400">{description}</p>

      <div className="mt-4 space-y-2 rounded-xl border border-white/10 bg-slate-950/60 p-4">
        {stats.map((stat) => (
          <div key={stat.label} className="flex items-center justify-between text-sm">
            <span className="text-slate-400">{stat.label}</span>
            <span className="font-medium text-slate-100">{stat.value}</span>
          </div>
        ))}
      </div>

      <Link
        href={href}
        className="mt-5 inline-flex rounded-full border border-indigo-300/30 bg-indigo-500/10 px-4 py-2 text-sm font-semibold text-indigo-100 transition hover:bg-indigo-500/20"
      >
        {cta}
      </Link>
    </article>
  );
}

export function IncomePlanningSystem({ data }: Props) {
  return (
    <div className="space-y-8">
      <MoneySummaryDashboard data={data} />

      <section className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Utility Sections</p>
        <div className="grid gap-5 lg:grid-cols-2">
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
        </div>
      </section>
    </div>
  );
}
