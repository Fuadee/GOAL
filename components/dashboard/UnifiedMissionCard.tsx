import Link from 'next/link';

import { UnifiedMissionCardData } from '@/lib/dashboard/unified-mission';

const toneClassMap: Record<NonNullable<UnifiedMissionCardData['tone']>, string> = {
  critical: 'border-rose-200/70 bg-rose-400/20 text-rose-50',
  warning: 'border-amber-200/70 bg-amber-400/20 text-amber-50',
  info: 'border-cyan-200/70 bg-cyan-400/20 text-cyan-50',
  success: 'border-emerald-200/70 bg-emerald-400/20 text-emerald-50'
};

export function UnifiedMissionCard({ card }: { card: UnifiedMissionCardData }) {
  const toneClass = toneClassMap[card.tone ?? 'info'];

  return (
    <article className="premium-card h-full">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-200">{card.eyebrow}</p>
        <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${toneClass}`}>{card.tone ?? 'info'}</span>
      </div>

      <h3 className="mt-3 text-xl font-semibold leading-tight text-white">{card.title}</h3>

      <p className="mt-4 max-w-[30ch] text-xs font-medium leading-relaxed text-slate-300">{card.focusLabel}</p>
      <p className="mt-2 max-w-[24ch] text-lg font-semibold leading-snug text-white">{card.primaryText}</p>
      {card.secondaryText ? <p className="mt-3 max-w-[30ch] text-sm leading-relaxed text-slate-300">{card.secondaryText}</p> : null}

      <Link
        href={card.href}
        className="theme-button-secondary mt-5 text-sm text-slate-100"
      >
        {card.ctaLabel}
      </Link>
    </article>
  );
}
