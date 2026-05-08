import { ConstructionFocusView } from '@/lib/money/types';

type Props = {
  focus: ConstructionFocusView;
};

export function ConstructionFocusPanel({ focus }: Props) {
  return (
    <aside className="rounded-2xl border border-[#DDE3D5]/25 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#64748B]/80">Current Focus</p>
      <h4 className="mt-2 text-lg font-semibold text-[#1E293B]">Now Working On</h4>

      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-[#94A3B8]">Current step</dt>
          <dd className="font-medium text-[#1E293B]">{focus.currentStep}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-[#94A3B8]">Progress</dt>
          <dd className="font-medium text-[#64748B]">{focus.progressLabel}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-[#94A3B8]">Next milestone</dt>
          <dd className="font-medium text-[#1E293B]">{focus.nextMilestone}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-[#94A3B8]">Expected by</dt>
          <dd className="font-medium text-[#1E293B]">{focus.expectedByLabel}</dd>
        </div>
      </dl>

      <p className="mt-4 rounded-xl border border-[#DDE3D5] bg-[#F6F7F4]/70 px-3 py-2 text-sm text-[#64748B]">
        Latest update: <span className="text-slate-50">{focus.latestUpdate}</span>
      </p>
    </aside>
  );
}
