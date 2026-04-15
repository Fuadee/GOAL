'use client';

import type { ComponentType } from 'react';
import { AlarmClock, BedSingle, CigaretteOff, MoonStar } from 'lucide-react';
import { motion } from 'framer-motion';

import { Navbar } from '@/components/navbar';
import { PageHeader, PageShell } from '@/components/ui/mission';

type RuleCardProps = {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
};

type SituationCardProps = {
  title: string;
  actions: string[];
};

const sectionFadeIn = {
  initial: { opacity: 0, y: 10 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-12%' },
  transition: { duration: 0.3, ease: 'easeOut' }
} as const;

const cardClassName =
  'h-full rounded-2xl border border-slate-800/80 bg-[#111827] p-5 shadow-[0_12px_30px_rgba(2,8,20,0.32)] transition-transform duration-200 hover:-translate-y-0.5';

function SectionTitle({ icon: Icon, title }: { icon?: ComponentType<{ className?: string }>; title: string }) {
  return (
    <div className="mb-3 flex items-center gap-2.5">
      {Icon ? <Icon className="h-4.5 w-4.5 text-cyan-200" /> : null}
      <h2 className="text-lg font-semibold text-slate-100 sm:text-xl">{title}</h2>
    </div>
  );
}

function RuleCard({ icon: Icon, title, description }: RuleCardProps) {
  return (
    <article className={cardClassName}>
      <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 text-cyan-200">
        <Icon className="h-4.5 w-4.5" />
      </div>
      <h3 className="mt-3 text-sm font-semibold text-slate-100">{title}</h3>
      <p className="mt-1 text-sm text-slate-300">{description}</p>
    </article>
  );
}

function SituationCard({ title, actions }: SituationCardProps) {
  return (
    <article className={`${cardClassName} min-h-[190px]`}>
      <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
      <ul className="mt-3 space-y-2 text-sm text-slate-300">
        {actions.map((action) => (
          <li key={action} className="flex items-start gap-2.5">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300" />
            <span>{action}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

export default function SleepCyclePage() {
  return (
    <PageShell>
      <Navbar />

      <section className="page-container space-y-8">
        <PageHeader
          kicker="Secret Sauce"
          title="Sleep Cycle"
          description="ตื่นให้ตรงเวลาให้ได้ก่อน แล้วระบบชีวิตจะนิ่งขึ้นแบบ practical และทำซ้ำได้ทุกวัน"
        />

        <motion.section {...sectionFadeIn} className="space-y-3">
          <SectionTitle icon={AlarmClock} title="Core Rules" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <RuleCard icon={AlarmClock} title="Anchor Wake Time" description="ตื่น 07:30 ทุกวัน (+/- 1 ชั่วโมง)" />
            <RuleCard icon={BedSingle} title="No Long Nap" description="งีบได้ แต่ห้ามเกิน 30 นาที" />
            <RuleCard icon={MoonStar} title="Control Night" description="ลด dopamine activity ก่อนนอน" />
            <RuleCard icon={CigaretteOff} title="No Smoke Before Bed" description="งดบุหรี่ก่อนนอนอย่างน้อย 2 ชั่วโมง" />
          </div>
        </motion.section>

        <motion.section {...sectionFadeIn} className="space-y-3">
          <SectionTitle icon={MoonStar} title="Situation Mode" />
          <div className="grid gap-4 sm:grid-cols-3">
            <SituationCard
              title="เมื่อคืนเที่ยวถึงตี 3"
              actions={['ตื่น 08:30', 'งีบ 20 นาที', 'กลับนอนก่อนเที่ยงคืน']}
            />
            <SituationCard title="ง่วงตอนบ่าย" actions={['งีบ 20 นาที หรือ ลุกเดิน', 'ห้ามดูหนังยาว']} />
            <SituationCard title="นอนไม่หลับ" actions={['ลุกจากเตียง', 'ไม่ฝืนนอน', 'กลับมานอนเมื่อเริ่มง่วง']} />
          </div>
        </motion.section>

        <motion.section {...sectionFadeIn} className="space-y-3">
          <SectionTitle icon={BedSingle} title="3-Day Reset" />
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { day: 'Day 1', text: 'ตื่นตามเวลา (ฝืนให้ได้)' },
              { day: 'Day 2', text: 'ง่วงเร็วขึ้นและพลังเริ่มนิ่ง' },
              { day: 'Day 3', text: 'นาฬิกาชีวภาพกลับเข้าโหมดทำงาน' }
            ].map((step) => (
              <article key={step.day} className={cardClassName}>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{step.day}</p>
                <p className="mt-3 text-sm text-slate-200">{step.text}</p>
              </article>
            ))}
          </div>
        </motion.section>

        <motion.section {...sectionFadeIn} className="space-y-3">
          <SectionTitle icon={CigaretteOff} title="Warning" />
          <article className={cardClassName}>
            <ul className="grid gap-2 text-sm text-slate-300 sm:grid-cols-2 sm:gap-x-8">
              {['นอนชดเชยยาว', 'ดูซีรีส์บนเตียง', 'เปลี่ยนเวลานอนทุกวัน', 'สูบบุหรี่ก่อนนอน'].map((item) => (
                <li key={item} className="flex items-center gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-300" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
        </motion.section>
      </section>
    </PageShell>
  );
}
