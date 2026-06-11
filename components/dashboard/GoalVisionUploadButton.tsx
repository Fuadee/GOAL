'use client';

import { useRef } from 'react';

type GoalVisionUploadButtonProps = {
  label: 'Upload' | 'Change';
  disabled?: boolean;
  onFileSelected: (file: File) => void;
};

export function GoalVisionUploadButton({ label, disabled = false, onFileSelected }: GoalVisionUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const displayLabel = label === 'Change' ? 'เปลี่ยน' : 'อัปโหลด';

  return (
    <>
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
          onFileSelected(file);
        }}
      />
      <button
        type="button"
        disabled={disabled}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          inputRef.current?.click();
        }}
        className="rounded-full border border-slate-200 bg-white/95 px-3 py-1.5 text-[11px] font-semibold tracking-[0.01em] text-[color:var(--text-primary)] shadow-sm transition hover:border-blue-300 hover:text-[color:var(--accent)] disabled:opacity-60"
      >
        {displayLabel}
      </button>
    </>
  );
}
