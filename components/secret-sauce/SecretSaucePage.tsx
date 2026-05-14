'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useMemo, useState } from 'react';

import { SECRET_SAUCE_TOPICS } from './topics';

function TopicPills({
  activeTopicId,
  onSelect
}: {
  activeTopicId: string;
  onSelect: (topicId: string) => void;
}) {
  return (
    <section className="-mx-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0" aria-label="Topic selector">
      <div className="inline-flex min-w-full gap-2 sm:min-w-0">
        {SECRET_SAUCE_TOPICS.map((topic) => {
          const isActive = topic.id === activeTopicId;

          return (
            <button
              key={topic.id}
              type="button"
              onClick={() => onSelect(topic.id)}
              className={`rounded-full border px-4 py-2 text-sm font-medium tracking-[0.01em] transition-all duration-250 ease-out sm:text-[15px] ${
                isActive
                  ? 'border-cyan-300/70 bg-cyan-300/12 text-cyan-100 shadow-[0_0_0_1px_rgba(103,232,249,0.2)]'
                  : 'border-slate-700/85 bg-slate-900/55 text-slate-300 hover:border-slate-500 hover:text-slate-100'
              }`}
              aria-pressed={isActive}
            >
              <span className="mr-2" aria-hidden>
                {topic.emoji}
              </span>
              {topic.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function TopicHero({ title, subtitle, emoji }: { title: string; subtitle: string; emoji: string }) {
  return (
    <section className="rounded-3xl border border-slate-700/70 bg-gradient-to-br from-slate-900 via-slate-900/95 to-[#111b30] p-6 sm:p-8 lg:p-10">
      <p className="text-xl sm:text-2xl" aria-hidden>
        {emoji}
      </p>
      <h1 className="mt-4 text-2xl font-semibold leading-tight text-slate-50 sm:text-3xl lg:text-[2.1rem]">{title}</h1>
      <p className="mt-3 max-w-3xl text-base leading-relaxed text-slate-300 sm:text-lg">{subtitle}</p>
    </section>
  );
}

function KnowledgeCardGrid({ cards }: { cards: typeof SECRET_SAUCE_TOPICS[number]['cards'] }) {
  return (
    <section className="grid gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        return (
          <article
            key={card.title}
            className="rounded-2xl border border-slate-700/70 bg-slate-900/65 p-4 transition duration-200 ease-out hover:-translate-y-0.5 hover:border-slate-500/80"
          >
            <p className="text-lg leading-none sm:text-xl" aria-hidden>{card.icon}</p>
            <h2 className="mt-3 text-base font-semibold leading-snug text-slate-100">{card.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-300 sm:text-[0.95rem]">{card.body}</p>
          </article>
        );
      })}
    </section>
  );
}

function SituationModeSection({ situations }: { situations: typeof SECRET_SAUCE_TOPICS[number]['situations'] }) {
  return (
    <section className="space-y-3 sm:space-y-4">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200/95">Situation Mode</h2>
        <p className="mt-1 text-sm text-slate-400">กรณีพิเศษที่ควรจำไว้ เพื่อรับมือทันทีแบบไม่ต้องคิดเยอะ</p>
      </div>
      <div className="grid gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
        {situations.map((situation) => (
          <article
            key={situation.title}
            className="rounded-2xl border border-slate-700/70 bg-[#101a2e]/70 p-4 transition duration-200 hover:border-slate-500/80"
          >
            <h3 className="text-base font-semibold text-slate-100">{situation.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-300 sm:text-[0.95rem]">{situation.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function RuleOfDaySection({ rules }: { rules: [ { title: string; body: string }, { title: string; body: string }, { title: string; body: string } ] }) {
  return (
    <section className="space-y-3 sm:space-y-4">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200/95">Rule of the Day</h2>
      </div>
      <div className="grid gap-3 sm:gap-4 xl:grid-cols-3">
        {rules.map((rule) => (
          <article key={rule.title} className="rounded-2xl border border-slate-700/70 bg-[#101a2e]/70 p-4">
            <h3 className="text-base font-semibold text-slate-100">{rule.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-300 sm:text-[0.95rem]">{rule.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function MemorySection({ bullets }: { bullets: string[] }) {
  return (
    <section className="space-y-3 rounded-2xl border border-slate-700/70 bg-slate-900/65 p-4 sm:p-5">
      <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200/95">สิ่งที่ต้องจำ</h2>
      <ul className="space-y-2 text-sm text-slate-200 sm:text-[0.95rem]">
        {bullets.map((item) => (
          <li key={item} className="flex gap-2 leading-relaxed">
            <span aria-hidden className="text-cyan-300">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function DailyChecklistSection({ items }: { items: string[] }) {
  return (
    <section className="space-y-3 rounded-2xl border border-slate-700/70 bg-gradient-to-br from-slate-900/90 to-[#13213c]/80 p-4 sm:p-5">
      <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200/95">Daily Checklist</h2>
      <div className="grid gap-2 sm:grid-cols-2">
        {items.map((item) => (
          <div key={item} className="flex items-start gap-2 rounded-xl border border-slate-700/60 bg-slate-900/60 px-3 py-2 text-sm text-slate-200">
            <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded border border-cyan-300/70 text-[10px] text-cyan-200">✓</span>
            <span>{item}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function SecretSaucePage() {
  const [activeTopicId, setActiveTopicId] = useState(SECRET_SAUCE_TOPICS[0]?.id ?? 'sleep');

  const activeTopic = useMemo(
    () => SECRET_SAUCE_TOPICS.find((topic) => topic.id === activeTopicId) ?? SECRET_SAUCE_TOPICS[0],
    [activeTopicId]
  );

  if (!activeTopic) return null;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:gap-8 sm:px-6 sm:py-8 lg:py-10">
      <TopicPills activeTopicId={activeTopic.id} onSelect={setActiveTopicId} />

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTopic.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.24, ease: 'easeOut' }}
          className="space-y-6 sm:space-y-8"
        >
          <TopicHero title={activeTopic.title} subtitle={activeTopic.subtitle} emoji={activeTopic.emoji} />
          <KnowledgeCardGrid cards={activeTopic.cards} />
          {activeTopic.id === 'eating-reset' && activeTopic.ruleOfDay ? (
            <RuleOfDaySection rules={activeTopic.ruleOfDay} />
          ) : (
            <SituationModeSection situations={activeTopic.situations} />
          )}
          {activeTopic.memoryBullets ? <MemorySection bullets={activeTopic.memoryBullets} /> : null}
          {activeTopic.dailyChecklist ? <DailyChecklistSection items={activeTopic.dailyChecklist} /> : null}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
