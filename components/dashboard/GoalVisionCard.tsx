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
    <article className="group relative isolate aspect-[4/5] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_18px_44px_-32px_rgba(37,99,235,0.38)]">
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
          alt={`ภาพวิสัยทัศน์ ${item.label}`}
          fill
          sizes="(max-width: 767px) 50vw, (max-width: 1279px) 50vw, 20vw"
          className="absolute inset-0 object-cover transition duration-500 group-hover:scale-[1.02]"
        />
      ) : (
        <button
          type="button"
          disabled={isUploading || isRemoving}
          onClick={() => inputRef.current?.click()}
          className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-slate-50 text-[color:var(--text-secondary)] transition hover:bg-blue-50/60 disabled:opacity-60"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-8 w-8 text-[color:var(--accent)]">
            <path fill="currentColor" d="M19 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2m0 14H5V6h14zm-4-7-2.5 3.01L11 12l-3 4h8z" />
          </svg>
          <span className="text-sm font-medium tracking-wide">อัปโหลด</span>
        </button>
      )}

      <div className="pointer-events-none absolute inset-0 z-20 bg-slate-950/0 transition duration-300 group-hover:bg-slate-950/10" />

      <div className="pointer-events-none absolute right-3 top-3 z-30 flex items-center gap-2 opacity-0 transition duration-300 group-hover:opacity-100">
        <button
          type="button"
          disabled={isUploading || isRemoving}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            inputRef.current?.click();
          }}
          className="pointer-events-auto rounded-full border border-slate-200 bg-white/95 px-2.5 py-1 text-[10px] font-semibold tracking-[0.01em] text-[color:var(--text-primary)] shadow-sm backdrop-blur-sm transition hover:border-blue-300 hover:text-[color:var(--accent)] disabled:opacity-60"
        >
          {imageUrl ? 'เปลี่ยน' : 'อัปโหลด'}
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
            className="pointer-events-auto rounded-full border border-red-200 bg-white/95 px-2.5 py-1 text-[10px] font-semibold tracking-[0.01em] text-red-600 shadow-sm backdrop-blur-sm transition hover:border-red-300 hover:bg-red-50 disabled:opacity-60"
          >
            ลบ
          </button>
        ) : null}
      </div>

      {imageUrl ? <Link href={item.href} aria-label={`เปิดหน้าเป้าหมาย ${item.label}`} className="absolute inset-0 z-10" /> : null}
    </article>
  );
}
