import Link from 'next/link';

import { UnifiedMissionCardData } from '@/lib/dashboard/unified-mission';

const toneClassMap: Record<NonNullable<UnifiedMissionCardData['tone']>, string> = {
  critical: 'border-rose-300/35 bg-rose-500/10 text-rose-100',
  warning: 'border-amber-300/35 bg-amber-500/10 text-amber-100',
  info: 'border-cyan-300/35 bg-cyan-500/10 text-cyan-100',
  success: 'border-emerald-300/35 bg-emerald-500/10 text-emerald-100'
};

export function UnifiedMissionCard({ card }: { card: UnifiedMissionCardData }) {
  const toneClass = toneClassMap[card.tone ?? 'info'];

  return (
    <article className="rounded-2xl border border-white/10 bg-slate-900/75 p-4 shadow-[0_0_18px_rgba(15,23,42,0.45)]">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-300">{card.eyebrow}</p>
        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${toneClass}`}>{card.tone ?? 'info'}</span>
      </div>

      <h3 className="mt-2 text-lg font-semibold text-white">{card.title}</h3>

      <p className="mt-3 text-xs text-slate-400">{card.focusLabel}</p>
      <p className="mt-1 line-clamp-2 text-sm font-medium text-slate-100">{card.primaryText}</p>
      {card.secondaryText ? <p className="mt-1 line-clamp-2 text-xs text-slate-400">{card.secondaryText}</p> : null}

      <Link
        href={card.href}
        className="mt-4 inline-flex rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/10"
      >
        {card.ctaLabel}
      </Link>
    </article>
  );
}
