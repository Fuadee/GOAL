'use client';

import Link from 'next/link';
import Image from 'next/image';

import { GoalVisionItem } from '@/lib/goal-vision/config';

import { GoalVisionUploadButton } from './GoalVisionUploadButton';

type GoalVisionCardProps = {
  item: GoalVisionItem;
  imageUrl: string | null;
  isUploading: boolean;
  isRemoving: boolean;
  onUpload: (file: File) => void;
  onRemove: () => void;
};

export function GoalVisionCard({ item, imageUrl, isUploading, isRemoving, onUpload, onRemove }: GoalVisionCardProps) {
  return (
    <Link
      href={item.href}
      className="group relative block min-h-[240px] overflow-hidden rounded-3xl border border-white/12 bg-slate-950/60 shadow-[0_16px_60px_rgba(2,6,23,0.65)] transition duration-300 hover:-translate-y-1.5 hover:border-cyan-300/50 hover:shadow-[0_20px_70px_rgba(56,189,248,0.18)]"
    >
      {imageUrl ? (
        <>
          <Image src={imageUrl} alt={`${item.label} vision`} fill sizes="(max-width: 768px) 100vw, 20vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/42 to-slate-950/10" />
        </>
      ) : (
        <div className={`absolute inset-0 bg-gradient-to-br ${item.placeholderGlow}`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.2),transparent_42%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(255,255,255,0.18),transparent_35%)]" />
          <div className="absolute inset-0 bg-slate-950/60" />
        </div>
      )}

      <div className="relative z-10 flex h-full flex-col justify-between p-5">
        <div className="flex justify-end gap-2">
          <GoalVisionUploadButton label={imageUrl ? 'Change' : 'Upload'} disabled={isUploading || isRemoving} onFileSelected={onUpload} />
          {imageUrl ? (
            <button
              type="button"
              disabled={isUploading || isRemoving}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onRemove();
              }}
              className="rounded-full border border-rose-300/45 bg-rose-950/55 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-rose-100 transition hover:border-rose-200/85 hover:bg-rose-900/70 disabled:opacity-60"
            >
              Remove
            </button>
          ) : null}
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-[0.28em] text-slate-300/90">Goal Domain</p>
          <h3 className="mt-1 text-xl font-semibold text-white drop-shadow-[0_0_24px_rgba(56,189,248,0.25)]">{item.label}</h3>
          {!imageUrl ? <p className={`mt-2 text-xs ${item.placeholderAccent}`}>+ Upload ภาพเป้าหมายของหมวดนี้</p> : null}
        </div>
      </div>
    </Link>
  );
}
