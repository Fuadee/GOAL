import Link from 'next/link';

import { MoneyDashboardData } from '@/lib/money/types';

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

type Props = { data: MoneyDashboardData };

function SummaryCard({ label, value, tone = 'text-[#1E293B]' }: { label: string; value: string; tone?: string }) {
  return (
    <article className="rounded-2xl border border-[#DDE3D5] bg-white/60 p-4">
      <p className="text-[11px] uppercase tracking-[0.2em] text-[#94A3B8]">{label}</p>
      <p className={`mt-2 text-xl font-semibold md:text-2xl ${tone}`}>{value}</p>
    </article>
  );
}

export function MoneySummaryDashboard({ data }: Props) {
  const progress = Math.max(0, Math.min(data.progressPercent, 100));

  return (
    <section className="space-y-4 rounded-3xl border border-[#DDE3D5]/15 bg-white/60 p-5 shadow-sm shadow-sm md:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#334155]/65">Summary Dashboard</p>
          <h2 className="mt-2 text-2xl font-semibold text-[#1E293B] md:text-3xl">Income Planning System</h2>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/money-management/plan"
            className="rounded-full border border-[#DDE3D5]/30 bg-[#EEF1EA]/10 px-4 py-2 text-sm font-medium text-[#64748B] hover:bg-[#EEF1EA]/20"
          >
            Plan to 100K
          </Link>
          <p className="rounded-full border border-[#DDE3D5] bg-white/5 px-3 py-1 text-sm text-[#64748B]">Net progress: {data.progressPercent.toFixed(1)}%</p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <SummaryCard label="Target Net Income" value={currency.format(data.targetIncome)} />
        <SummaryCard label="Gross Income" value={currency.format(data.grossIncome)} tone="text-emerald-300" />
        <SummaryCard label="Total Expense" value={currency.format(data.totalExpense)} tone="text-amber-300" />
        <SummaryCard label="Net Income" value={currency.format(data.netIncome)} tone={data.netIncome >= 0 ? 'text-[#334155]' : 'text-rose-300'} />
        <SummaryCard label="Remaining Gap" value={currency.format(data.gap)} tone="text-rose-300" />
      </div>

      <div className="space-y-2">
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#EEF1EA]">
          <div className="h-full rounded-full bg-white" style={{ width: `${progress}%` }} />
        </div>
        <p className={`text-sm ${data.netIncome <= 0 ? 'text-rose-300' : 'text-[#64748B]'}`}>
          Remaining gap to 100K goal: <span className="font-semibold text-rose-300">{currency.format(data.gap)}</span>
        </p>
      </div>
    </section>
  );
}
