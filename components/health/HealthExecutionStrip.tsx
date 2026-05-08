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
    <section className="rounded-2xl border border-[#DDE3D5] bg-[#F6F7F4]/70 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#94A3B8]">Execution Strip</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {steps.map((step, index) => (
          <div
            key={step}
            className={`rounded-xl border px-3 py-2 text-sm font-medium ${
              index === activeStep
                ? 'border-[#DDE3D5]/60 bg-[#EEF1EA]/15 text-[#334155]'
                : 'border-[#DDE3D5] bg-white/5 text-[#94A3B8]'
            }`}
          >
            Step {index + 1}: {step}
          </div>
        ))}
      </div>
    </section>
  );
}
