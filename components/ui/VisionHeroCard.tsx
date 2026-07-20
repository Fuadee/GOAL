import Image from 'next/image';

type VisionHeroCardProps = {
  imageUrl: string | null;
  imageAlt: string;
  emptyImageLabel: string;
  eyebrow: string;
  title: string;
  description: string;
  progressLabel: string;
  completed: number;
  target: number;
  unitLabel: string;
};

export function VisionHeroCard({
  imageUrl,
  imageAlt,
  emptyImageLabel,
  eyebrow,
  title,
  description,
  progressLabel,
  completed,
  target,
  unitLabel
}: VisionHeroCardProps) {
  const progress = target > 0 ? Math.min(Math.max((completed / target) * 100, 0), 100) : 0;

  return (
    <article className="grid overflow-hidden rounded-[24px] border border-blue-200 bg-gradient-to-br from-white via-blue-50/40 to-sky-100/60 shadow-[0_22px_52px_-38px_rgba(37,99,235,0.55)] md:grid-cols-[minmax(240px,0.8fr)_minmax(0,1.7fr)]">
      <div className="relative min-h-[210px] overflow-hidden bg-blue-100 md:min-h-full">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            priority
            sizes="(max-width: 767px) 100vw, 32vw"
            className="object-cover object-center"
          />
        ) : (
          <div
            className="flex h-full min-h-[210px] items-center justify-center bg-gradient-to-br from-blue-100 to-sky-50 text-blue-600"
            aria-label={emptyImageLabel}
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-14 w-14">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 9h8M8 13h5m-7.5 7h13A2.5 2.5 0 0 0 21 17.5v-11A2.5 2.5 0 0 0 18.5 4h-13A2.5 2.5 0 0 0 3 6.5v11A2.5 2.5 0 0 0 5.5 20ZM8 4V2m8 2V2" />
            </svg>
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-col justify-center p-5 sm:p-7 lg:p-8">
        <p className="text-sm font-semibold text-blue-700">{eyebrow}</p>
        <h1 className="mt-2 text-2xl font-semibold leading-tight text-slate-900 sm:text-3xl">{title}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">{description}</p>

        <div className="mt-6 rounded-2xl border border-blue-100 bg-white/80 p-4 shadow-sm sm:p-5">
          <div className="flex items-center justify-between gap-4">
            <span className="font-medium text-slate-700">{progressLabel}</span>
            <span className="font-numeric shrink-0 text-lg font-semibold text-blue-700">{progress.toFixed(0)}%</span>
          </div>
          <div
            className="mt-3 h-2.5 overflow-hidden rounded-full bg-blue-100"
            role="progressbar"
            aria-label={progressLabel}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
          >
            <div className="h-full rounded-full bg-blue-600 transition-[width] duration-300" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-3 text-sm text-slate-600">{completed} จาก {target} {unitLabel}</p>
        </div>
      </div>
    </article>
  );
}
