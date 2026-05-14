import Link from 'next/link';

import { IncomeSourceRow, MoneyDashboardData } from '@/lib/money/types';

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
    <article className="premium-card">
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

type IncomeCategory = 'real' | 'growing' | 'future';
type IncomeStability = 'stable' | 'unstable' | 'building' | 'future';

type IncomeRealityItem = {
  id: string;
  name: string;
  amount: number;
  frequencyLabel: string;
  note?: string | null;
  category: IncomeCategory;
  stability: IncomeStability;
  isCountedInRealIncome: boolean;
};

const categoryMeta: Record<IncomeCategory, { title: string; description: string }> = {
  real: { title: 'REAL MONTHLY INCOME', description: 'เงินที่เข้าจริงในตอนนี้' },
  growing: { title: 'GROWING INCOME', description: 'รายได้ที่กำลังสร้าง ยังไม่เสถียร' },
  future: { title: 'FUTURE INCOME', description: 'เครื่องยนต์การเงินอนาคต (ยังไม่คิดเป็นกระแสเงินสดตอนนี้)' }
};

const badgeClassByStability: Record<IncomeStability, string> = {
  stable: 'border-emerald-400/30 bg-emerald-500/15 text-emerald-100',
  unstable: 'border-amber-400/30 bg-amber-500/15 text-amber-100',
  building: 'border-sky-400/30 bg-sky-500/15 text-sky-100',
  future: 'border-violet-400/30 bg-violet-500/15 text-violet-100'
};

const stabilityLabel: Record<IncomeStability, string> = {
  stable: 'Stable',
  unstable: 'Unstable',
  building: 'Building',
  future: 'Future'
};

function normalizeIncomeSource(source: IncomeSourceRow): IncomeRealityItem {
  const category: IncomeCategory = source.category ?? 'real';
  const stability: IncomeStability = source.stability ?? 'stable';
  const isCountedInRealIncome = source.is_counted_in_real_income ?? category === 'real';

  return {
    id: source.id,
    name: source.name,
    amount: Number(source.actual_income || source.expected_income || 0),
    frequencyLabel: source.frequency_label ?? '/month',
    note: source.note,
    category,
    stability,
    isCountedInRealIncome
  };
}

function IncomeRealityCard({ data }: { data: MoneyDashboardData }) {
  const items = data.incomeSources.map(normalizeIncomeSource);
  const groups: Record<IncomeCategory, IncomeRealityItem[]> = { real: [], growing: [], future: [] };

  items.forEach((item) => groups[item.category].push(item));

  const realMonthlyIncome = items.filter((item) => item.isCountedInRealIncome).reduce((sum, item) => sum + item.amount, 0);
  const potentialMonthlyIncome = items
    .filter((item) => item.category === 'growing' && !item.isCountedInRealIncome)
    .reduce((sum, item) => sum + item.amount, 0);
  const futureIncome = items.filter((item) => item.category === 'future').reduce((sum, item) => sum + item.amount, 0);

  return (
    <article className="premium-card flex h-full flex-col">
      <h3 className="text-lg font-semibold text-white">Where My Money Comes From</h3>
      <p className="mt-1 text-sm text-slate-400">Separate real income, growing income, and future income</p>

      <div className="mt-4 grid gap-2 rounded-xl border border-white/10 bg-slate-950/50 p-4 text-sm sm:grid-cols-3">
        <div>
          <p className="text-slate-400">Real Monthly Income</p>
          <p className="mt-1 text-base font-semibold text-slate-100">{currency.format(realMonthlyIncome)}</p>
        </div>
        <div>
          <p className="text-slate-400">Potential Monthly Income</p>
          <p className="mt-1 text-base font-semibold text-slate-100">{currency.format(potentialMonthlyIncome)}</p>
        </div>
        <div>
          <p className="text-slate-400">Future Income Not Counted Yet</p>
          <p className="mt-1 text-base font-semibold text-slate-100">{currency.format(futureIncome)}</p>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {(Object.keys(categoryMeta) as IncomeCategory[]).map((category) => (
          <section key={category} className="space-y-2 rounded-xl border border-white/10 bg-slate-950/40 p-3">
            <div>
              <p className="text-xs font-semibold tracking-[0.15em] text-slate-300">{categoryMeta[category].title}</p>
              <p className="text-xs text-slate-500">{categoryMeta[category].description}</p>
            </div>
            <div className="space-y-2">
              {groups[category].length === 0 ? (
                <p className="rounded-lg border border-dashed border-white/10 px-3 py-2 text-xs text-slate-500">No sources yet</p>
              ) : (
                groups[category].map((item) => (
                  <div key={item.id} className="rounded-lg border border-white/10 bg-slate-900/70 px-3 py-2">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-slate-100">{item.name}</p>
                        <p className="text-xs text-slate-400">
                          {currency.format(item.amount)} {item.frequencyLabel}
                        </p>
                      </div>
                      <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs ${badgeClassByStability[item.stability]}`}>
                        {stabilityLabel[item.stability]}
                      </span>
                    </div>
                    {item.note ? <p className="mt-1 text-xs text-slate-500">{item.note}</p> : null}
                  </div>
                ))
              )}
            </div>
          </section>
        ))}
      </div>

      <Link
        href="/money-management/income"
        className="mt-5 inline-flex w-fit rounded-full border border-indigo-300/30 bg-indigo-500/10 px-4 py-2 text-sm font-semibold text-indigo-100 transition hover:bg-indigo-500/20"
      >
        Manage income sources
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
        <div className="grid items-stretch gap-5 lg:grid-cols-2">
          <IncomeRealityCard data={data} />

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
