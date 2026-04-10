import { RunnerTodayStatus } from '@/lib/running/quest.types';

const steps = ['ยังไม่เริ่ม', 'ออกไปวิ่ง', 'บันทึกผล'];

function getActiveStep(todayStatus: RunnerTodayStatus): number {
  if (todayStatus === 'not_run') return 0;
  if (todayStatus === 'rest') return 1;
  return 2;
}

export function HealthExecutionStrip({ todayStatus }: { todayStatus: RunnerTodayStatus }) {
  const activeStep = getActiveStep(todayStatus);

  return (
    <section className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Execution Strip</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {steps.map((step, index) => (
          <div
            key={step}
            className={`rounded-xl border px-3 py-2 text-sm font-medium ${
              index === activeStep
                ? 'border-cyan-300/60 bg-cyan-500/15 text-cyan-100'
                : 'border-white/10 bg-white/5 text-slate-400'
            }`}
          >
            Step {index + 1}: {step}
          </div>
        ))}
      </div>
    </section>
  );
}
