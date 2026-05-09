import { RunnerTodayStatus } from '@/lib/running/quest.types';

const steps = ['วางแผน', 'ลงมือวิ่ง', 'บันทึกผล'];

function getActiveStep(todayStatus: RunnerTodayStatus): number {
  if (todayStatus === 'not_run') return 0;
  if (todayStatus === 'rest') return 1;
  return 2;
}

export function HealthExecutionStrip({ todayStatus }: { todayStatus: RunnerTodayStatus }) {
  const activeStep = getActiveStep(todayStatus);

  return (
    <section className="rounded-2xl border border-white/10 bg-[#111827] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Mission Path</p>
      <div className="mt-3 space-y-2">
        {steps.map((step, index) => (
          <div
            key={step}
            className={`relative rounded-xl border px-3 py-2.5 text-sm ${
              index < activeStep
                ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-100'
                : index === activeStep
                ? 'border-cyan-300/60 bg-cyan-500/15 text-slate-100'
                : 'border-white/10 bg-slate-900/70 text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <p className="font-semibold">{step}</p>
              <span className="text-xs uppercase tracking-[0.12em] text-slate-400">Step {index + 1}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
