import { LifeDirectionSummary } from '@/lib/dashboard/types';

import { FloatMotion } from './MotionReveal';

type DashboardHeroProps = {
  lifeDirection: LifeDirectionSummary;
  activeGoals: number;
  urgentAlerts: number;
};

const kpiClass = 'mission-card p-4';

export function DashboardHero({ lifeDirection, activeGoals, urgentAlerts }: DashboardHeroProps) {
  return (
    <FloatMotion>
      <section className="mission-card p-6 md:p-8">
        <div className="relative z-10 grid gap-6 lg:grid-cols-[1.3fr_1fr] lg:items-center">
          <div className="space-y-3">
            <p className="mission-label">MISSION CONTROL</p>
            <h1 className="mission-title">SYSTEM STATUS</h1>
            <p className="body-text max-w-xl">
              ศูนย์บัญชาการชีวิตของคุณสำหรับกำหนดทิศทาง, คุมภารกิจ, และเร่งผลลัพธ์ให้ถึงเป้าหมายระดับสูง
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className={kpiClass}>
              <p className="caption-text uppercase tracking-widest">Current Status</p>
              <p className="mt-2 text-2xl font-bold text-cyan-300">{lifeDirection.score}%</p>
            </div>
            <div className={kpiClass}>
              <p className="caption-text uppercase tracking-widest">Active Missions</p>
              <p className="mt-2 text-2xl font-bold text-violet-300">{activeGoals}</p>
            </div>
            <div className={kpiClass}>
              <p className="caption-text uppercase tracking-widest">Critical Alerts</p>
              <p className="mt-2 text-2xl font-bold text-red-400">{urgentAlerts}</p>
            </div>
          </div>
        </div>
      </section>
    </FloatMotion>
  );
}
