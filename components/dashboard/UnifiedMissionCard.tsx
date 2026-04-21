import Link from 'next/link';

import { UnifiedMissionCardData } from '@/lib/dashboard/unified-mission';

const toneClassMap: Record<NonNullable<UnifiedMissionCardData['tone']>, string> = {
  critical: 'border-rose-200/80 bg-rose-400/25 text-rose-50',
  warning: 'border-amber-200/80 bg-amber-400/25 text-amber-50',
  info: 'border-cyan-200/80 bg-cyan-400/25 text-cyan-50',
  success: 'border-emerald-200/80 bg-emerald-400/25 text-emerald-50'
};

export function UnifiedMissionCard({ card }: { card: UnifiedMissionCardData }) {
  const toneClass = toneClassMap[card.tone ?? 'info'];

  return (
    <article className="premium-card h-full">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-100">{card.eyebrow}</p>
        <span className={`rounded-full border px-2.5 py-1 text-xs font-medium uppercase tracking-[0.14em] ${toneClass}`}>{card.tone ?? 'info'}</span>
      </div>

      <div className="mt-3 space-y-3">
        <h3 className="text-lg font-semibold leading-tight text-white">{card.title}</h3>

        <p className="max-w-[30ch] text-sm font-medium leading-relaxed text-white/70">{card.focusLabel}</p>
        <p className="max-w-[24ch] text-base font-semibold leading-snug text-white md:text-lg">{card.primaryText}</p>
        {card.secondaryText ? <p className="max-w-[30ch] text-sm leading-relaxed text-white/70">{card.secondaryText}</p> : null}
      </div>

      <Link
        href={card.href}
        className="theme-button-secondary mt-5 text-sm text-slate-100"
      >
        {card.ctaLabel}
      </Link>
    </article>
  );
}
