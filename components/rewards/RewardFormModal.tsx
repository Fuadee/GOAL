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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-4">
      <form action={onSubmit} className="relative flex max-h-[90vh] w-full max-w-[30rem] flex-col overflow-hidden rounded-3xl border border-white/15 bg-slate-950/85 shadow-[0_32px_100px_rgba(0,0,0,0.6)] backdrop-blur-xl">
        <input type="hidden" name="level_id" value={levelId} />
        <div className="flex items-center justify-between border-b border-white/10 px-5 pb-4 pt-5 sm:px-6">
          <h4 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">Your Reward</h4>
          <button type="button" onClick={onClose} className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-white/10">ปิด</button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:space-y-6 sm:px-6">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-200">Reward Title</span>
            <input
              name="title"
              required
              defaultValue={defaultValues?.title ?? 'Reward'}
              className="w-full rounded-2xl border border-white/15 bg-black/25 px-4 py-3 text-lg font-medium text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/50"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-200">Reward Image Upload</span>
            <input
              name="reward_image_upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full rounded-2xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-slate-100 file:mr-3 file:rounded-xl file:border-0 file:bg-cyan-400/20 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-cyan-100"
            />
          </label>

          <input type="hidden" name="image_url" value={previewImageUrl} />
          <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/10 to-black/20 p-2 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
            {previewImageUrl ? (
              <img src={previewImageUrl} alt="Reward preview" className="h-64 w-full rounded-2xl object-cover sm:h-72" />
            ) : (
              <div className="flex h-64 w-full items-center justify-center rounded-2xl border border-dashed border-white/20 bg-black/20 text-sm text-slate-300 sm:h-72">
                Upload an image to bring your reward to life
              </div>
            )}
          </div>
        </div>

        <div className="sticky bottom-0 border-t border-white/10 bg-slate-950/95 px-5 py-4 sm:px-6">
          <button className="w-full rounded-full bg-cyan-400/20 px-5 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/30">
            บันทึกรางวัล
          </button>
        </div>
      </form>
    </div>
  );
}
