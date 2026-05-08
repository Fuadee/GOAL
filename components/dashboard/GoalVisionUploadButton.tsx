'use client';

import { useRef } from 'react';

type GoalVisionUploadButtonProps = {
  label: 'Upload' | 'Change';
  disabled?: boolean;
  onFileSelected: (file: File) => void;
};

export function GoalVisionUploadButton({ label, disabled = false, onFileSelected }: GoalVisionUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

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
        className="rounded-full border border-[#DDE3D5] bg-[#F6F7F4]/70 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#1E293B] transition hover:border-[#DDE3D5]/70 hover:text-[#334155] disabled:opacity-60"
      >
        {label}
      </button>
    </>
  );
}
