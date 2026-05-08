import { PipelineBadge } from './PipelineBadge';
import { getStageProgressPercent, stageConfig } from './stage-utils';
import { RentalHouse } from './types';

type HouseCardProps = {
  house: RentalHouse;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(value);

export function HouseCard({ house }: HouseCardProps) {
  const progressPercent = getStageProgressPercent(house.currentStage);

  return (
    <article className="space-y-4 rounded-2xl border border-[#DDE3D5] bg-white/55 p-5 shadow-sm backdrop-blur">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[#94A3B8]">Mission #{house.targetOrder.toString().padStart(2, '0')}</p>
          <h3 className="mt-1 text-xl font-semibold text-[#1E293B]">{house.name}</h3>
        </div>
        <PipelineBadge stage={house.currentStage} />
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between text-xs text-[#64748B]">
          <span>Pipeline Progress</span>
          <span>{Math.round(progressPercent)}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-[#EEF1EA]">
          <div
            className="h-full rounded-full bg-white"
            style={{ width: `${progressPercent}%` }}
            aria-hidden="true"
          />
        </div>
        <p className="mt-2 text-sm text-[#64748B]">{stageConfig[house.currentStage].description}</p>
      </div>

      <dl className="grid grid-cols-2 gap-3 text-sm">
        <DataRow label="Budget" value={formatCurrency(house.budget)} />
        <DataRow label="Loan Amount" value={formatCurrency(house.loanAmount)} />
        <DataRow label="Installment" value={formatCurrency(house.monthlyInstallment)} />
        <DataRow label="Monthly Rent" value={formatCurrency(house.monthlyRent)} />
        <DataRow label="Monthly Expense" value={formatCurrency(house.monthlyExpense)} />
        <DataRow
          label="Cash Flow"
          value={formatCurrency(house.netCashFlow)}
          valueClassName={house.netCashFlow >= 0 ? 'text-emerald-300' : 'text-rose-300'}
        />
      </dl>

      <div className="flex flex-wrap items-center gap-2 pt-1">
        <button
          type="button"
          className="rounded-full border border-sky-300/30 bg-sky-300/10 px-4 py-2 text-xs font-semibold text-sky-100 transition hover:bg-sky-300/20"
        >
          View details
        </button>
        <button
          type="button"
          className="rounded-full border border-[#DDE3D5] bg-white/5 px-4 py-2 text-xs font-semibold text-[#64748B] transition hover:bg-white/10"
        >
          Edit
        </button>
      </div>
    </article>
  );
}

type DataRowProps = {
  label: string;
  value: string;
  valueClassName?: string;
};

function DataRow({ label, value, valueClassName = 'text-[#1E293B]' }: DataRowProps) {
  return (
    <div className="rounded-xl border border-[#DDE3D5] bg-[#F6F7F4]/55 p-3">
      <dt className="text-xs uppercase tracking-wide text-[#94A3B8]">{label}</dt>
      <dd className={`mt-1 font-medium ${valueClassName}`}>{value}</dd>
    </div>
  );
}
