'use client';

import type { ComponentType, ReactNode } from 'react';
import {
  AlarmClock,
  BedSingle,
  CigaretteOff,
  MoonStar,
} from 'lucide-react';
import { motion, type Variants } from 'framer-motion';

import { Navbar } from '@/components/navbar';
import { PageShell } from '@/components/ui/mission';

type RuleCardProps = {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
  accent: string;
};

type SituationCardProps = {
  title: string;
  actions: string[];
  badge: string;
};

type SectionLabelProps = {
  icon: ComponentType<{ className?: string }>;
  label: string;
};

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 120,
      damping: 18,
      mass: 0.6
    }
  }
};

function SectionLabel({ icon: Icon, label }: SectionLabelProps) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.03] px-3 py-1.5 backdrop-blur-sm">
      <Icon className="h-3.5 w-3.5 text-cyan-200/90" />
      <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-100/80">{label}</span>
    </div>
  );
}

function CardShell({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.08] via-white/[0.04] to-white/[0.02] p-5 shadow-[0_1px_0_rgba(255,255,255,0.1)_inset,0_30px_70px_rgba(2,8,23,0.5)] backdrop-blur-xl transition duration-500 hover:-translate-y-1 hover:border-cyan-200/25 hover:shadow-[0_1px_0_rgba(255,255,255,0.14)_inset,0_36px_80px_rgba(34,211,238,0.14)] ${className}`}
    >
      <div className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-70" />
      {children}
    </div>
  );
}

function HeroCard() {
  return (
    <motion.section
      variants={sectionVariants}
      initial="hidden"
      animate="show"
      className="relative overflow-hidden rounded-[32px] border border-cyan-200/15 bg-gradient-to-br from-sky-500/18 via-indigo-500/14 to-violet-500/20 p-7 shadow-[0_1px_0_rgba(255,255,255,0.18)_inset,0_40px_110px_rgba(15,23,42,0.7)] backdrop-blur-xl sm:p-11"
    >
      <motion.div
        aria-hidden
        className="absolute -left-20 top-0 h-52 w-52 rounded-full bg-cyan-400/25 blur-3xl"
        animate={{ x: [0, 16, 0], y: [0, -8, 0] }}
        transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="absolute -right-20 bottom-0 h-56 w-56 rounded-full bg-violet-500/20 blur-3xl"
        animate={{ x: [0, -12, 0], y: [0, 10, 0] }}
        transition={{ duration: 9, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="absolute inset-y-0 -left-1/3 w-1/2 rotate-12 bg-gradient-to-r from-transparent via-white/12 to-transparent"
        animate={{ x: ['0%', '260%'] }}
        transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY, ease: 'linear', repeatDelay: 3 }}
      />

      <div className="relative space-y-5 text-center">
        <SectionLabel icon={MoonStar} label="SECRET SAUCE / SLEEP CYCLE" />
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-cyan-100 shadow-[0_0_30px_rgba(56,189,248,0.4)] sm:h-14 sm:w-14">
          <MoonStar className="h-6 w-6 sm:h-7 sm:w-7" />
        </div>
        <h1 className="text-balance text-3xl font-semibold leading-[1.2] text-slate-50 sm:text-5xl">🔥 ตื่นให้ตรงเวลา ชีวิตจะคุมได้เอง</h1>
        <p className="mx-auto max-w-2xl text-sm leading-relaxed text-blue-100/85 sm:text-lg">Sleep cycle ไม่ต้อง perfect แต่ต้อง control ได้</p>
      </div>
    </motion.section>
  );
}

function RuleCard({ icon: Icon, title, description, accent }: RuleCardProps) {
  return (
    <motion.article variants={itemVariants} whileHover={{ rotateX: 1, rotateY: -1 }} transition={{ duration: 0.25 }} style={{ transformStyle: 'preserve-3d' }}>
      <CardShell className="h-full rounded-2xl p-4 sm:p-5">
        <div className={`absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100 ${accent}`} />
        <div className="relative">
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-cyan-100 shadow-[0_0_20px_rgba(56,189,248,0.22)]">
            <Icon className="h-4.5 w-4.5" />
          </div>
          <h2 className="mt-3 text-sm font-semibold text-slate-100 sm:text-base">{title}</h2>
          <p className="mt-1 text-sm leading-relaxed text-slate-300/90">{description}</p>
        </div>
      </CardShell>
    </motion.article>
  );
}

function SituationCard({ title, actions, badge }: SituationCardProps) {
  return (
    <motion.article variants={itemVariants} whileHover={{ y: -4, rotateX: 1 }} transition={{ type: 'spring', stiffness: 170, damping: 18 }}>
      <CardShell className="w-[292px] min-h-[205px] shrink-0 snap-center rounded-2xl p-5 sm:w-auto">
        <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/70 to-transparent" />
        <div className="relative flex h-full flex-col">
          <span className="mb-3 inline-flex w-fit rounded-full border border-cyan-100/15 bg-cyan-300/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-100/80">
            {badge}
          </span>
          <h3 className="text-base font-semibold text-slate-50">{title}</h3>
          <ul className="mt-3 space-y-2">
            {actions.map((action) => (
              <li key={action} className="flex items-start gap-2.5 text-sm text-slate-200/95">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-r from-cyan-300 to-blue-300 shadow-[0_0_8px_rgba(103,232,249,0.8)]" />
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardShell>
    </motion.article>
  );
}

function ResetTimeline() {
  const steps = [
    { day: 'Day 1', text: 'ตื่นตามเวลา (ฝืน)' },
    { day: 'Day 2', text: 'เริ่มง่วงเร็วขึ้น' },
    { day: 'Day 3', text: 'กลับเข้าระบบ' }
  ];

  return (
    <motion.section variants={sectionVariants} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-15%' }}>
      <div className="mb-4 sm:mb-5">
        <SectionLabel icon={BedSingle} label="RESET SYSTEM" />
      </div>
      <CardShell className="rounded-3xl p-5 sm:p-6">
        <div className="relative grid gap-3 sm:grid-cols-3 sm:gap-4">
          <div className="pointer-events-none absolute left-10 right-10 top-8 hidden h-px bg-gradient-to-r from-cyan-400/30 via-indigo-300/70 to-cyan-400/30 sm:block" />
          {steps.map((step, index) => (
            <motion.div
              key={step.day}
              variants={itemVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-10%' }}
              className="relative rounded-2xl border border-white/10 bg-slate-950/45 p-4 shadow-[0_0_0_1px_rgba(15,23,42,0.4)] transition duration-300 hover:-translate-y-1 hover:border-cyan-200/35"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`relative inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold shadow-[0_0_20px_rgba(56,189,248,0.45)] ${
                    index === 0
                      ? 'bg-cyan-300 text-slate-900'
                      : 'border border-cyan-100/20 bg-slate-800 text-cyan-100'
                  }`}
                >
                  {index + 1}
                </span>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">{step.day}</p>
              </div>
              <p className="mt-3 text-sm text-slate-100">{step.text}</p>
            </motion.div>
          ))}
        </div>
      </CardShell>
    </motion.section>
  );
}

function WarningCard() {
  const antiPatterns = ['นอนชดเชยยาว', 'ดูซีรี่บนเตียง', 'เปลี่ยนเวลานอนทุกวัน', 'สูบบุหรี่ก่อนนอน'];

  return (
    <motion.section variants={sectionVariants} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-15%' }}>
      <CardShell className="rounded-3xl border-rose-300/20 bg-gradient-to-b from-rose-500/12 via-fuchsia-500/[0.08] to-transparent p-6 sm:p-7">
        <div className="mb-4 flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-rose-200/25 bg-rose-400/10 text-rose-100 shadow-[0_0_25px_rgba(251,113,133,0.3)]">
            <CigaretteOff className="h-5 w-5" />
          </span>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-rose-100/70">Warning Block</p>
            <h2 className="text-lg font-semibold text-rose-50">สิ่งที่ห้ามทำ</h2>
          </div>
        </div>
        <ul className="grid gap-2.5 text-sm text-rose-50/90 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-3">
          {antiPatterns.map((item) => (
            <li key={item} className="flex items-center gap-2.5">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-300 shadow-[0_0_8px_rgba(253,164,175,0.8)]" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </CardShell>
    </motion.section>
  );
}

function InsightCard() {
  return (
    <motion.section
      variants={sectionVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-12%' }}
      className="relative mx-auto max-w-2xl"
    >
      <div className="pointer-events-none absolute inset-x-16 bottom-3 h-12 rounded-full bg-cyan-400/20 blur-2xl" />
      <CardShell className="rounded-3xl p-8 text-center sm:p-10">
        <motion.div
          className="mx-auto mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-cyan-100"
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 4.5, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
        >
          <MoonStar className="h-4.5 w-4.5" />
        </motion.div>
        <p className="text-xl font-semibold leading-relaxed text-slate-100 sm:text-2xl">❝ ง่วง ≠ ต้องนอน</p>
        <p className="text-xl font-semibold leading-relaxed text-cyan-100 sm:text-2xl">คุมเวลา = คุมชีวิต ❞</p>
      </CardShell>
    </motion.section>
  );
}

export default function SleepCyclePage() {
  return (
    <PageShell className="relative overflow-hidden bg-[#070b17] text-slate-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(14,165,233,0.16),transparent_42%),radial-gradient(circle_at_80%_35%,rgba(124,58,237,0.14),transparent_40%),radial-gradient(circle_at_50%_100%,rgba(14,116,144,0.18),transparent_45%)]" />
        <div className="absolute -left-16 top-20 h-72 w-72 rounded-full bg-cyan-500/20 blur-[120px]" />
        <div className="absolute right-[-40px] top-[38%] h-80 w-80 rounded-full bg-violet-500/20 blur-[130px]" />
        <div className="absolute bottom-[-100px] left-1/2 h-60 w-[70%] -translate-x-1/2 rounded-full bg-blue-400/15 blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(rgba(148,163,184,0.25)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.25)_1px,transparent_1px)] [background-size:42px_42px]" />
      </div>

      <Navbar />

      <main className="relative mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-8 sm:gap-12 sm:px-6 sm:py-12">
        <HeroCard />

        <motion.section
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-15%' }}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <RuleCard
            icon={AlarmClock}
            title="⏰ Anchor Wake Time"
            description="ตื่น 07:30 ทุกวัน (+/- 1 ชม.)"
            accent="bg-gradient-to-br from-cyan-400/8 via-transparent to-transparent"
          />
          <RuleCard
            icon={BedSingle}
            title="😴 No Long Nap"
            description="งีบได้ แต่ห้ามเกิน 30 นาที"
            accent="bg-gradient-to-br from-blue-400/10 via-transparent to-transparent"
          />
          <RuleCard
            icon={MoonStar}
            title="🌙 Control Night"
            description="ห้าม binge / ลด dopamine ก่อนนอน"
            accent="bg-gradient-to-br from-violet-400/12 via-transparent to-transparent"
          />
          <RuleCard
            icon={CigaretteOff}
            title="🚬 No Smoke Before Bed"
            description="งดบุหรี่ก่อนนอน 2 ชั่วโมง"
            accent="bg-gradient-to-br from-sky-400/10 via-transparent to-transparent"
          />
        </motion.section>

        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-15%' }}
          className="space-y-3"
        >
          <SectionLabel icon={AlarmClock} label="Situation Mode" />
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-10%' }}
            className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <SituationCard
              badge="Recovery"
              title="เมื่อคืนเที่ยวถึงตี 3"
              actions={['ตื่น 08:30', 'งีบ 20 นาที', 'กลับนอนก่อนเที่ยงคืน']}
            />
            <SituationCard badge="Midday" title="ง่วงตอนบ่าย" actions={['งีบ 20 นาที หรือ ลุกเดิน', 'ห้ามดูหนังยาว']} />
            <SituationCard badge="Emergency" title="นอนไม่หลับ" actions={['ลุกจากเตียง', 'ไม่ฝืน', 'กลับมานอนเมื่อเริ่มง่วง']} />
          </motion.div>
        </motion.section>

        <ResetTimeline />
        <WarningCard />
        <InsightCard />
      </main>
    </PageShell>
  );
}
