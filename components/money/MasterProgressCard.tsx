import { ProgressSection } from './ProgressSection';

type MasterProgressCardProps = {
  totalTarget: number;
  completed: number;
  rented: number;
  underConstruction: number;
  loanInProgress: number;
  totalRentIncome: number;
  totalDebtPerMonth: number;
  netCashFlow: number;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(value);

export function MasterProgressCard({
  totalTarget,
  completed,
  rented,
  underConstruction,
  loanInProgress,
  totalRentIncome,
  totalDebtPerMonth,
  netCashFlow
}: MasterProgressCardProps) {
  const completionPercent = (completed / totalTarget) * 100;

  return (
    <section className="space-y-5 rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-[0_0_50px_rgba(56,189,248,0.08)] backdrop-blur md:p-8">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Master Progress</p>
        <h2 className="text-2xl font-semibold text-white md:text-3xl">12-House Mission Control</h2>
      </div>

      <ProgressSection
        title="Portfolio Completion"
        valueLabel={`${completed} / ${totalTarget} houses completed`}
        percent={completionPercent}
        helperText="Track progress from debt setup to stable rental cash flow."
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <MetricTile label="Target Houses" value={`${totalTarget}`} />
        <MetricTile label="Completed Houses" value={`${completed}`} />
        <MetricTile label="Houses Rented" value={`${rented}`} />
        <MetricTile label="Under Construction" value={`${underConstruction}`} />
        <MetricTile label="Loan Pipeline" value={`${loanInProgress}`} />
        <MetricTile label="Net Cash Flow / Month" value={formatCurrency(netCashFlow)} positive={netCashFlow >= 0} />
        <MetricTile label="Rental Income / Month" value={formatCurrency(totalRentIncome)} />
        <MetricTile label="Debt Service / Month" value={formatCurrency(totalDebtPerMonth)} />
      </div>
    </section>
  );
}

type MetricTileProps = {
  label: string;
  value: string;
  positive?: boolean;
};

function MetricTile({ label, value, positive }: MetricTileProps) {
  return (
    <article className="rounded-2xl border border-white/10 bg-slate-900/50 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`mt-2 text-xl font-semibold ${positive === undefined ? 'text-white' : positive ? 'text-emerald-300' : 'text-rose-300'}`}>
        {value}
      </p>
    </article>
  );
}
