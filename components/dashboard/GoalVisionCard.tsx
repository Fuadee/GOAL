'use client';

import { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

import { GoalVisionItem } from '@/lib/goal-vision/config';

type GoalVisionCardProps = {
  item: GoalVisionItem;
  imageUrl: string | null;
  isUploading: boolean;
  isRemoving: boolean;
  onUpload: (file: File) => void;
  onRemove: () => void;
};

export function GoalVisionCard({ item, imageUrl, isUploading, isRemoving, onUpload, onRemove }: GoalVisionCardProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <article className="group relative isolate min-h-[280px] overflow-hidden rounded-3xl border border-white/12 bg-slate-950/60 shadow-[0_16px_60px_rgba(2,6,23,0.65)] transition duration-300 hover:-translate-y-1.5 hover:border-cyan-300/45 hover:shadow-[0_20px_70px_rgba(56,189,248,0.18)]">
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onClick={(event) => {
          event.currentTarget.value = '';
        }}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (!file) return;
          onUpload(file);
        }}
      />

      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={`${item.label} vision`}
          fill
          sizes="(max-width: 768px) 100vw, 20vw"
          className="absolute inset-0 object-cover"
        />
      ) : (
        <button
          type="button"
          disabled={isUploading || isRemoving}
          onClick={() => inputRef.current?.click()}
          className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-slate-900/40 text-slate-100 transition hover:bg-slate-900/55 disabled:opacity-60"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-8 w-8 text-slate-200/90">
            <path fill="currentColor" d="M19 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2m0 14H5V6h14zm-4-7-2.5 3.01L11 12l-3 4h8z" />
          </svg>
          <span className="text-sm font-medium tracking-wide">Upload</span>
        </button>
      )}

      <div className="pointer-events-none absolute inset-0 z-20 bg-slate-950/0 transition duration-300 group-hover:bg-slate-950/15" />

      <div className="pointer-events-none absolute right-3 top-3 z-30 flex items-center gap-2 opacity-0 transition duration-300 group-hover:opacity-100">
        <button
          type="button"
          disabled={isUploading || isRemoving}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            inputRef.current?.click();
          }}
          className="pointer-events-auto rounded-full border border-white/40 bg-slate-950/65 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-100 backdrop-blur-sm transition hover:border-cyan-300/75 hover:text-cyan-100 disabled:opacity-60"
        >
          {imageUrl ? 'Change' : 'Upload'}
        </button>

        {imageUrl ? (
          <button
            type="button"
            disabled={isUploading || isRemoving}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onRemove();
            }}
            className="pointer-events-auto rounded-full border border-rose-300/45 bg-rose-950/65 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-rose-100 backdrop-blur-sm transition hover:border-rose-200/85 hover:bg-rose-900/80 disabled:opacity-60"
          >
            Remove
          </button>
        ) : null}
      </div>

      {imageUrl ? <Link href={item.href} aria-label={`Open ${item.label} goal page`} className="absolute inset-0 z-10" /> : null}
    </article>
  );
}
