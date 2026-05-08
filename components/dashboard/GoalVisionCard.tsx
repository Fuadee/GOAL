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
    <article className="group relative isolate aspect-[16/9] overflow-hidden rounded-2xl border border-white/10 bg-[#0b0f14] shadow-[0_20px_45px_rgba(0,0,0,0.4)]">
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
        <Image src={imageUrl} alt={`${item.label} vision`} fill sizes="(max-width: 768px) 100vw, 80vw" className="absolute inset-0 object-cover transition duration-700 group-hover:scale-[1.01]" />
      ) : (
        <button type="button" disabled={isUploading || isRemoving} onClick={() => inputRef.current?.click()} className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-black/25 text-[#ece9e2] transition hover:bg-black/35 disabled:opacity-60">
          <span className="rounded-full border border-white/30 px-3 py-1 text-xs">Upload image</span>
        </button>
      )}

      <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />

      <div className="absolute bottom-4 left-4 z-30">
        <p className="text-xs uppercase tracking-[0.15em] text-[#d8c4a0]">Hero Vision</p>
        <p className="text-xl font-medium text-white">{item.label}</p>
      </div>

      <div className="absolute right-4 top-4 z-30 flex items-center gap-2 opacity-0 transition group-hover:opacity-100">
        <button type="button" disabled={isUploading || isRemoving} onClick={(event) => { event.preventDefault(); event.stopPropagation(); inputRef.current?.click(); }} className="rounded-full border border-white/35 bg-black/40 px-3 py-1 text-xs text-white backdrop-blur-sm disabled:opacity-60">{imageUrl ? 'Change' : 'Upload'}</button>
        {imageUrl ? <button type="button" disabled={isUploading || isRemoving} onClick={(event) => { event.preventDefault(); event.stopPropagation(); onRemove(); }} className="rounded-full border border-white/35 bg-black/40 px-3 py-1 text-xs text-white backdrop-blur-sm disabled:opacity-60">Remove</button> : null}
      </div>

      {imageUrl ? <Link href={item.href} aria-label={`Open ${item.label} goal page`} className="absolute inset-0 z-10" /> : null}
    </article>
  );
}
