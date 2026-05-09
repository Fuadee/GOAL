import { RunnerTodayStatus } from '@/lib/running/quest.types';

const steps = [
  { title: 'เตรียมภารกิจ', desc: 'เช็กเป้าระยะและ pace ของวันนี้' },
  { title: 'ลงมือวิ่ง', desc: 'วิ่งตามเงื่อนไขให้ครบโดยไม่หยุด' },
  { title: 'บันทึกผล', desc: 'บันทึกผลเพื่ออัปเดตความคืบหน้า' }
];

function getActiveStep(todayStatus: RunnerTodayStatus): number {
  if (todayStatus === 'not_run') return 0;
  if (todayStatus === 'rest') return 1;
  return 2;
}

export function HealthExecutionStrip({ todayStatus }: { todayStatus: RunnerTodayStatus }) {
  const activeStep = getActiveStep(todayStatus);

  return (
    <section className="rounded-2xl border border-white/10 bg-[#0F172A] p-4">
      <p className="text-sm font-semibold text-slate-100">เส้นทางภารกิจ</p>
      <div className="mt-3 space-y-2">
        {steps.map((step, index) => {
          const isCompleted = index < activeStep;
          const isCurrent = index === activeStep;
          return (
            <div
              key={step.title}
              className={`rounded-xl border p-3 ${
                isCompleted
                  ? 'border-emerald-400/40 bg-emerald-500/10'
                  : isCurrent
                  ? 'border-cyan-400/50 bg-cyan-500/10'
                  : 'border-slate-600 bg-slate-900/90'
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-100">{index + 1}. {step.title}</p>
                <span className="text-xs text-slate-300">{isCompleted ? 'completed' : isCurrent ? 'current' : 'locked'}</span>
              </div>
              <p className="mt-1 text-xs text-slate-300">{step.desc}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
