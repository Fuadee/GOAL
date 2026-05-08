import { PipelineBadge } from './PipelineBadge';
import { RentalHouse } from './types';

type LoanTrackingSectionProps = {
  houses: RentalHouse[];
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(value);

export function LoanTrackingSection({ houses }: LoanTrackingSectionProps) {
  return (
    <section className="space-y-4 rounded-3xl border border-[#DDE3D5] bg-white/[0.03] p-6 backdrop-blur md:p-8">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.22em] text-[#94A3B8]">Loan Tracking</p>
        <h2 className="text-2xl font-semibold text-[#1E293B]">Financing Control Panel</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-y-2 text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-[#94A3B8]">
              <th className="px-3 py-2">House</th>
              <th className="px-3 py-2">Requested</th>
              <th className="px-3 py-2">Approved</th>
              <th className="px-3 py-2">Lender</th>
              <th className="px-3 py-2">Submitted</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Note</th>
            </tr>
          </thead>
          <tbody>
            {houses.map((house) => (
              <tr key={house.id} className="rounded-2xl border border-[#DDE3D5] bg-white/55 text-[#1E293B]">
                <td className="px-3 py-3 font-medium">{house.name}</td>
                <td className="px-3 py-3">{formatCurrency(house.loanAmount)}</td>
                <td className="px-3 py-3">{formatCurrency(house.approvedAmount)}</td>
                <td className="px-3 py-3 text-[#64748B]">{house.lender}</td>
                <td className="px-3 py-3 text-[#64748B]">{house.loanSubmittedDate}</td>
                <td className="px-3 py-3"><PipelineBadge stage={house.currentStage} /></td>
                <td className="px-3 py-3 text-[#64748B]">{house.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
