import Link from 'next/link';

import { UnifiedMissionCardData } from '@/lib/dashboard/unified-mission';

type PillarColorConfig = {
  border: string;
  title: string;
  accentText: string;
  hoverGlow: string;
  button: string;
  badgeByTone: Record<NonNullable<UnifiedMissionCardData['tone']>, string>;
};

const pillarColorMap: Record<UnifiedMissionCardData['key'], PillarColorConfig> = {
  smv: {
    border: 'border-rose-300/35',
    title: 'text-rose-200',
    accentText: 'text-rose-300',
    hoverGlow: 'hover:shadow-[0_18px_44px_rgba(244,63,94,0.18)]',
    button: 'border-rose-300/45 text-rose-100 hover:border-rose-200/70 hover:bg-rose-500/12',
    badgeByTone: {
      critical: 'border-rose-200/70 bg-rose-400/25 text-rose-50',
      warning: 'border-rose-200/60 bg-rose-500/18 text-rose-100',
      info: 'border-rose-300/55 bg-rose-500/14 text-rose-100',
      success: 'border-rose-200/60 bg-rose-400/20 text-rose-50'
    }
  },
  money: {
    border: 'border-orange-300/35',
    title: 'text-amber-200',
    accentText: 'text-amber-300',
    hoverGlow: 'hover:shadow-[0_18px_44px_rgba(251,146,60,0.18)]',
    button: 'border-amber-300/45 text-amber-100 hover:border-amber-200/70 hover:bg-amber-500/12',
    badgeByTone: {
      critical: 'border-orange-200/70 bg-orange-400/24 text-orange-50',
      warning: 'border-amber-200/70 bg-amber-400/24 text-amber-50',
      info: 'border-amber-200/60 bg-amber-500/18 text-amber-100',
      success: 'border-amber-200/60 bg-amber-400/20 text-amber-50'
    }
  },
  health: {
    border: 'border-cyan-300/35',
    title: 'text-cyan-200',
    accentText: 'text-cyan-300',
    hoverGlow: 'hover:shadow-[0_18px_44px_rgba(34,211,238,0.18)]',
    button: 'border-cyan-300/45 text-cyan-100 hover:border-cyan-200/70 hover:bg-cyan-500/12',
    badgeByTone: {
      critical: 'border-cyan-200/70 bg-cyan-500/24 text-cyan-50',
      warning: 'border-sky-200/70 bg-sky-500/22 text-sky-50',
      info: 'border-cyan-200/70 bg-cyan-400/24 text-cyan-50',
      success: 'border-cyan-200/70 bg-cyan-300/26 text-cyan-50'
    }
  },
  innovation: {
    border: 'border-yellow-300/35',
    title: 'text-yellow-200',
    accentText: 'text-yellow-300',
    hoverGlow: 'hover:shadow-[0_18px_44px_rgba(250,204,21,0.17)]',
    button: 'border-yellow-300/45 text-yellow-100 hover:border-yellow-200/70 hover:bg-yellow-400/12',
    badgeByTone: {
      critical: 'border-yellow-200/70 bg-yellow-400/24 text-yellow-50',
      warning: 'border-yellow-200/70 bg-yellow-300/24 text-yellow-50',
      info: 'border-yellow-200/65 bg-yellow-400/18 text-yellow-100',
      success: 'border-yellow-200/65 bg-yellow-300/20 text-yellow-50'
    }
  },
  world: {
    border: 'border-fuchsia-300/35',
    title: 'text-fuchsia-200',
    accentText: 'text-fuchsia-300',
    hoverGlow: 'hover:shadow-[0_18px_44px_rgba(217,70,239,0.19)]',
    button: 'border-fuchsia-300/45 text-fuchsia-100 hover:border-fuchsia-200/70 hover:bg-fuchsia-500/12',
    badgeByTone: {
      critical: 'border-fuchsia-200/70 bg-fuchsia-400/25 text-fuchsia-50',
      warning: 'border-pink-200/70 bg-pink-400/24 text-pink-50',
      info: 'border-fuchsia-200/65 bg-fuchsia-500/18 text-fuchsia-100',
      success: 'border-fuchsia-200/65 bg-fuchsia-400/20 text-fuchsia-50'
    }
  }
};

export function UnifiedMissionCard({ card }: { card: UnifiedMissionCardData }) {
  const colors = pillarColorMap[card.key];
  const toneClass = colors.badgeByTone[card.tone ?? 'info'];

  return (
    <article className={`premium-card h-full ${colors.border} ${colors.hoverGlow}`}>
      <div className="flex items-center justify-between gap-2">
        <p className={`text-[11px] font-semibold uppercase tracking-[0.22em] ${colors.title}`}>{card.eyebrow}</p>
        <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${toneClass}`}>{card.tone ?? 'info'}</span>
      </div>

      <div className="mt-3 space-y-3">
        <h3 className="text-lg font-bold leading-tight text-white">{card.title}</h3>

        <p className="max-w-[30ch] text-sm font-medium leading-relaxed text-white/80">{card.focusLabel}</p>
        <p className={`max-w-[24ch] text-base font-semibold leading-snug md:text-lg ${colors.accentText}`}>{card.primaryText}</p>
        {card.secondaryText ? <p className="max-w-[30ch] text-sm leading-relaxed text-white/75">{card.secondaryText}</p> : null}
      </div>

      <Link
        href={card.href}
        className={`theme-button-secondary mt-5 text-sm ${colors.button}`}
      >
        {card.ctaLabel}
      </Link>
    </article>
  );
}
