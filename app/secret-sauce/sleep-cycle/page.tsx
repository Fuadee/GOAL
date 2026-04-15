import type { ComponentType } from 'react';
import { CigaretteOff, MoonStar, TimerReset, AlarmClock, BedSingle } from 'lucide-react';

import { Navbar } from '@/components/navbar';
import { PageShell } from '@/components/ui/mission';

type RuleCardProps = {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
};

type SituationCardProps = {
  title: string;
  actions: string[];
  highlighted?: boolean;
};

function HeroCard() {
  return (
    <section className="rounded-2xl border border-cyan-300/20 bg-gradient-to-br from-blue-500/20 via-indigo-500/20 to-violet-500/20 p-6 text-center shadow-[0_0_0_1px_rgba(96,165,250,0.15),0_24px_48px_rgba(59,130,246,0.2)] sm:p-8">
      <h1 className="text-2xl font-bold leading-tight text-slate-50 sm:text-4xl">🔥 ตื่นให้ตรงเวลา ชีวิตจะคุมได้เอง</h1>
      <p className="mt-3 text-sm text-blue-100/90 sm:text-base">Sleep cycle ไม่ต้อง perfect แต่ต้อง control ได้</p>
    </section>
  );
}

function RuleCard({ icon: Icon, title, description }: RuleCardProps) {
  return (
    <article className="rounded-2xl border border-slate-700/60 bg-[#111827] p-4 shadow-[0_12px_24px_rgba(2,6,23,0.45)] transition duration-200 hover:scale-[1.02] hover:border-cyan-300/40 hover:shadow-[0_12px_28px_rgba(34,211,238,0.15)]">
      <Icon className="h-5 w-5 text-cyan-200" />
      <h2 className="mt-3 text-sm font-semibold text-slate-100">{title}</h2>
      <p className="mt-1 text-sm text-slate-300">{description}</p>
    </article>
  );
}

function SituationCard({ title, actions, highlighted = false }: SituationCardProps) {
  return (
    <article
      className={`w-[280px] shrink-0 snap-center rounded-2xl border border-slate-800/80 bg-[#111827] p-6 shadow-[0_0_0_1px_rgba(15,23,42,0.25)] transition duration-200 ${
        highlighted
          ? 'border-cyan-500/40 ring-1 ring-cyan-500/20 shadow-[0_0_30px_rgba(56,189,248,0.10)]'
          : ''
      } min-h-[260px]`}
    >
      <h3 className="text-base font-semibold text-slate-50">{title}</h3>
      <ul className="mt-4 space-y-2">
        {actions.map((action) => (
          <li key={action} className="flex items-start gap-2 text-sm text-slate-200">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300" />
            <span>{action}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

function ResetTimeline() {
  const steps = [
    { day: 'Day 1', text: 'ตื่นตามเวลา (ฝืน)' },
    { day: 'Day 2', text: 'เริ่มง่วงเร็วขึ้น' },
    { day: 'Day 3', text: 'กลับเข้าระบบ' }
  ];

  return (
    <section className="rounded-2xl border border-slate-700/70 bg-[#111827] p-4 sm:p-6">
      <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200/90">Reset System</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-3 sm:gap-4">
        {steps.map((step, index) => {
          const current = index === 0;

          return (
            <div key={step.day} className="relative rounded-2xl border border-slate-700/70 bg-slate-900/50 p-4">
              {index < steps.length - 1 ? (
                <span className="absolute right-[-14px] top-1/2 hidden h-px w-7 -translate-y-1/2 bg-slate-600 sm:block" />
              ) : null}
              <div className="flex items-center gap-2">
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                    current ? 'bg-cyan-300 text-slate-900' : 'bg-slate-700 text-slate-200'
                  }`}
                >
                  {index + 1}
                </span>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-300">{step.day}</p>
              </div>
              <p className="mt-3 text-sm text-slate-100">{step.text}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function WarningCard() {
  const antiPatterns = ['นอนชดเชยยาว', 'ดูซีรี่บนเตียง', 'เปลี่ยนเวลานอนทุกวัน', 'สูบบุหรี่ก่อนนอน'];

  return (
    <section className="rounded-2xl border border-rose-400/40 bg-rose-950/30 p-6 shadow-[0_0_0_1px_rgba(244,63,94,0.16),0_18px_42px_rgba(127,29,29,0.35)]">
      <h2 className="text-lg font-semibold text-rose-100">⚠️ สิ่งที่ห้ามทำ</h2>
      <ul className="mt-4 space-y-2">
        {antiPatterns.map((item) => (
          <li key={item} className="text-sm text-rose-100/90">
            • {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

function InsightCard() {
  return (
    <section className="mx-auto max-w-xl rounded-2xl border border-slate-700/70 bg-[#111827]/80 p-6 text-center">
      <p className="text-lg font-medium leading-relaxed text-slate-300">❝ ง่วง ≠ ต้องนอน</p>
      <p className="text-lg font-medium leading-relaxed text-slate-200">คุมเวลา = คุมชีวิต ❞</p>
    </section>
  );
}

export default function SleepCyclePage() {
  return (
    <PageShell className="bg-[#0B1220]">
      <Navbar />
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-6 sm:gap-6 sm:px-6 sm:py-10">
        <HeroCard />

        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <RuleCard icon={AlarmClock} title="⏰ Anchor Wake Time" description="ตื่น 07:30 ทุกวัน (+/- 1 ชม.)" />
          <RuleCard icon={BedSingle} title="😴 No Long Nap" description="งีบได้ แต่ห้ามเกิน 30 นาที" />
          <RuleCard icon={MoonStar} title="🌙 Control Night" description="ห้าม binge / ลด dopamine ก่อนนอน" />
          <RuleCard icon={CigaretteOff} title="🚬 No Smoke Before Bed" description="งดบุหรี่ก่อนนอน 2 ชั่วโมง" />
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <TimerReset className="h-5 w-5 shrink-0 text-cyan-300" />
            <h2 className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-200">Situation Mode</h2>
          </div>
          <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <SituationCard
              highlighted
              title="เมื่อคืนเที่ยวถึงตี 3"
              actions={['ตื่น 08:30', 'งีบ 20 นาที', 'กลับนอนก่อนเที่ยงคืน']}
            />
            <SituationCard title="ง่วงตอนบ่าย" actions={['งีบ 20 นาที หรือ ลุกเดิน', 'ห้ามดูหนังยาว']} />
            <SituationCard title="นอนไม่หลับ" actions={['ลุกจากเตียง', 'ไม่ฝืน', 'กลับมานอนเมื่อเริ่มง่วง']} />
          </div>
        </section>

        <ResetTimeline />
        <WarningCard />
        <InsightCard />
      </main>
    </PageShell>
  );
}
