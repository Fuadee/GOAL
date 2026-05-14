'use client';

import { ChangeEvent, useEffect, useState } from 'react';

type Props = {
  open: boolean;
  levelId: string;
  defaultValues?: { title?: string | null; imageUrl?: string | null };
  onClose: () => void;
  onSubmit: (fd: FormData) => void;
};

export function RewardFormModal({ open, levelId, defaultValues, onClose, onSubmit }: Props) {
  const [previewImageUrl, setPreviewImageUrl] = useState(defaultValues?.imageUrl ?? '');

  useEffect(() => {
    setPreviewImageUrl(defaultValues?.imageUrl ?? '');
  }, [defaultValues?.imageUrl, open]);

  if (!open) return null;

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPreviewImageUrl(typeof reader.result === 'string' ? reader.result : '');
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 sm:p-6">
      <form
        action={onSubmit}
        className="relative flex w-[calc(100vw-24px)] max-w-[32.5rem] flex-col rounded-3xl border border-white/15 bg-slate-950/90 shadow-[0_32px_100px_rgba(0,0,0,0.6)] backdrop-blur-xl sm:w-full"
      >
        <input type="hidden" name="level_id" value={levelId} />
        <div className="flex items-center justify-between border-b border-white/10 px-5 pb-3 pt-4 sm:px-6">
          <h4 className="text-xl font-semibold tracking-tight text-white">Your Reward</h4>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close reward form"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-base font-semibold leading-none text-white transition hover:bg-white/20"
          >
            ×
          </button>
        </div>

        <div className="space-y-3 px-5 py-4 sm:space-y-3.5 sm:px-6">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-slate-200">Reward Title</span>
            <input
              name="title"
              required
              defaultValue={defaultValues?.title ?? 'Reward'}
              className="h-10 w-full rounded-xl border border-white/15 bg-black/25 px-3.5 text-base font-medium text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/50"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-slate-200">Reward Image Upload</span>
            <input
              name="reward_image_upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="h-10 w-full rounded-xl border border-white/15 bg-black/20 px-3 text-sm text-slate-100 file:mr-3 file:rounded-lg file:border-0 file:bg-cyan-400/20 file:px-3 file:py-1 file:text-xs file:font-medium file:text-cyan-100"
            />
          </label>

          <input type="hidden" name="image_url" value={previewImageUrl} />
          <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/10 to-black/20 p-2 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
            {previewImageUrl ? (
              <img src={previewImageUrl} alt="Reward preview" className="h-[180px] w-full rounded-xl object-cover sm:h-[220px]" />
            ) : (
              <div className="flex h-[180px] w-full items-center justify-center rounded-xl border border-dashed border-white/20 bg-black/20 px-3 text-center text-sm text-slate-300 sm:h-[220px]">
                Upload an image to bring your reward to life
              </div>
            )}
          </div>
          <button className="mt-2 w-full rounded-full bg-cyan-400/20 px-5 py-2.5 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/30">
            บันทึกรางวัล
          </button>
        </div>
      </form>
    </div>
  );
}
