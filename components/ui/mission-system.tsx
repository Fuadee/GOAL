import Image from 'next/image';
import { ReactNode } from 'react';

type Accent = 'amber' | 'cyan';

const accents = {
  amber: {
    shell: 'border-amber-300/25 from-[#1c1410] via-[#251912] to-[#120f0c] shadow-[0_28px_70px_-38px_rgba(251,146,60,0.65)] hover:shadow-[0_32px_85px_-35px_rgba(251,146,60,0.75)]',
    glow: 'bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.17),transparent_50%)]',
    kicker: 'text-amber-100/80',
    text: 'text-amber-50',
    sub: 'text-amber-100/80',
    bar: 'from-amber-400 to-orange-300',
    button: 'border-amber-100/40 from-amber-200 via-orange-200 to-amber-100 text-[#2d1f10] shadow-[0_12px_24px_-14px_rgba(253,186,116,0.95)]'
  },
  cyan: {
    shell: 'border-cyan-300/25 from-[#0d1724] via-[#112032] to-[#0a1320] shadow-[0_28px_70px_-38px_rgba(34,211,238,0.45)] hover:shadow-[0_32px_85px_-35px_rgba(34,211,238,0.55)]',
    glow: 'bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.18),transparent_50%)]',
    kicker: 'text-cyan-100/80',
    text: 'text-cyan-50',
    sub: 'text-cyan-100/80',
    bar: 'from-cyan-400 to-blue-300',
    button: 'border-cyan-100/40 from-cyan-200 via-sky-200 to-blue-100 text-[#082132] shadow-[0_12px_24px_-14px_rgba(103,232,249,0.85)]'
  }
} as const;

export function MissionHeroCard({ accent = 'amber', kicker, title, children }: { accent?: Accent; kicker: string; title: string; children: ReactNode }) {
  const a = accents[accent];
  return <section className={`group relative overflow-hidden rounded-3xl border bg-gradient-to-br p-5 transition duration-500 sm:p-6 ${a.shell}`}><div className={`pointer-events-none absolute inset-0 rounded-3xl ${a.glow}`} /><div className="relative"><p className={`text-[11px] font-normal tracking-[0.02em] ${a.kicker}`}>{kicker}</p><h2 className={`mt-2 text-2xl font-semibold leading-tight sm:text-[1.75rem] ${a.text}`}>{title}</h2>{children}</div></section>;
}

export function MissionProgressSection({ accent = 'amber', value, label }: { accent?: Accent; value: number; label: string }) {
  const a = accents[accent];
  return <div className="mt-4 space-y-2"><p className={`text-sm ${a.sub}`}>{label}</p><div className="h-4 rounded-full bg-white/10 p-[2px]"><div className={`h-full rounded-full bg-gradient-to-r ${a.bar}`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} /></div></div>;
}

export function MissionActionBar({ children }: { children: ReactNode }) {
  return <div className="mt-4 flex w-full flex-wrap gap-2">{children}</div>;
}

export function MissionRewardCard({ accent = 'amber', missionTitle, rewardTitle, rewardImageUrl, emotionalCopy, description, isLocked, isClaimed, actions, cta }: { accent?: Accent; missionTitle?: string; rewardTitle: string; rewardImageUrl?: string; emotionalCopy?: string | null; description?: string | null; isLocked: boolean; isClaimed: boolean; actions?: ReactNode; cta: ReactNode }) {
  const a = accents[accent];
  return <section className="pt-2 sm:pt-3"><article className={`reward-card group relative overflow-hidden rounded-3xl border bg-gradient-to-br transition duration-500 ${a.shell}`}><div className={`pointer-events-none absolute inset-0 rounded-3xl ${a.glow}`} /><div className="relative flex flex-col md:grid md:max-h-[380px] md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]"><div className="relative h-[250px] overflow-hidden border-b border-white/10 bg-black md:h-full md:min-h-[320px] md:border-b-0 md:border-r md:border-white/10">{rewardImageUrl ? <Image src={rewardImageUrl} alt="รูปภาพรางวัลภารกิจ" fill className="object-cover object-center" sizes="(min-width: 768px) 60vw, 100vw" /> : <div className="flex h-full items-center justify-center text-sm text-slate-200">ยังไม่มีรูปภาพรางวัล</div>}<div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" /><div className="absolute inset-x-0 bottom-0 p-4 sm:p-5"><p className="line-clamp-2 text-2xl font-semibold text-white sm:text-3xl">{rewardTitle}</p><p className={`mt-1 line-clamp-2 text-sm ${a.sub}`}>ภารกิจสำเร็จแล้ว · {missionTitle || 'ภารกิจปัจจุบัน'}</p></div></div><div className="flex flex-col gap-4 p-5 sm:p-6"><div className="flex items-start justify-between gap-3"><span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white">{isClaimed ? 'รับรางวัลแล้ว' : isLocked ? 'ยังล็อกอยู่' : 'ปลดล็อกแล้ว'}</span>{actions}</div><p className={`text-2xl font-semibold leading-tight ${a.text}`}>{rewardTitle}</p><p className={`text-sm italic ${a.sub}`}>{emotionalCopy || description || 'ทำภารกิจนี้ให้สำเร็จ แล้วปลดล็อกช่วงเวลาที่ตั้งใจไว้ให้ตัวเอง'}</p><div className={`w-full rounded-xl border bg-gradient-to-r px-1 py-1 ${a.button}`}>{cta}</div></div></div></article></section>;
}
