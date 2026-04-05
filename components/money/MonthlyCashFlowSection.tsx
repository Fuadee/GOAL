type MonthlyCashFlowSectionProps = {
  totalIncome: number;
  totalExpense: number;
  totalInstallment: number;
  netCashFlow: number;
  occupancyRate: number;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(value);

export function MonthlyCashFlowSection({
  totalIncome,
  totalExpense,
  totalInstallment,
  netCashFlow,
  occupancyRate
}: MonthlyCashFlowSectionProps) {
  return (
    <section className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur md:p-8">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Monthly Cash Flow</p>
        <h2 className="text-2xl font-semibold text-white">Rental Income Summary</h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <CashMetric label="Rental Income" value={formatCurrency(totalIncome)} />
        <CashMetric label="Monthly Expenses" value={formatCurrency(totalExpense)} />
        <CashMetric label="Loan Installments" value={formatCurrency(totalInstallment)} />
        <CashMetric label="Net Cash Flow" value={formatCurrency(netCashFlow)} positive={netCashFlow >= 0} />
        <CashMetric label="Occupancy Rate" value={`${occupancyRate.toFixed(0)}%`} />
      </div>
    </section>
  );
}

type CashMetricProps = {
  label: string;
  value: string;
  positive?: boolean;
};

function CashMetric({ label, value, positive }: CashMetricProps) {
  return (
    <article className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`mt-2 text-lg font-semibold ${positive === undefined ? 'text-white' : positive ? 'text-emerald-300' : 'text-rose-300'}`}>
        {value}
      </p>
    </article>
  );
}
