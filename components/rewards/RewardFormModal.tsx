'use client';

import { ChangeEvent, useState } from 'react';

type Props = {
  open: boolean;
  levelId: string;
  defaultValues?: { title?: string | null; description?: string | null; emotionalCopy?: string | null; imageUrl?: string | null };
  onClose: () => void;
  onSubmit: (fd: FormData) => void;
};

export function RewardFormModal({ open, levelId, defaultValues, onClose, onSubmit }: Props) {
  const [previewImageUrl, setPreviewImageUrl] = useState(defaultValues?.imageUrl ?? '');
  if (!open) return null;

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPreviewImageUrl(typeof reader.result === 'string' ? reader.result : '');
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <form action={onSubmit} className="w-full max-w-xl rounded-2xl border border-white/10 bg-slate-900 p-5">
        <input type="hidden" name="level_id" value={levelId} />
        <input type="hidden" name="image_url" value={previewImageUrl} />
        <div className="mb-4 flex items-center justify-between"><h4 className="text-lg font-semibold text-white">เพิ่ม/แก้ไข Reward</h4><button type="button" onClick={onClose} className="rounded-full bg-white/10 px-3 py-1 text-xs text-white">ปิด</button></div>
        <div className="space-y-2.5 rounded-xl border border-dashed border-cyan-300/35 bg-cyan-500/5 p-3">
          <label className="space-y-1 text-sm text-slate-200"><span>Reward Title</span><input name="title" required defaultValue={defaultValues?.title ?? 'Running Reward'} className="w-full rounded-xl border border-white/15 bg-slate-950/60 px-3 py-2 text-white outline-none" /></label>
          <label className="space-y-1 text-sm text-slate-200"><span>Description</span><input name="description" required defaultValue={defaultValues?.description ?? 'รางวัลของคนที่ผ่านด่านวิ่งนี้ได้'} className="w-full rounded-xl border border-white/15 bg-slate-950/60 px-3 py-2 text-white outline-none" /></label>
          <label className="space-y-1 text-sm text-slate-200"><span>Emotional Copy</span><input name="emotional_copy" defaultValue={defaultValues?.emotionalCopy ?? 'เมื่อคุณผ่านด่านนี้ คุณไม่ได้แค่วิ่งครบ แต่คุณกำลังกลายเป็นคนที่แข็งแรงขึ้นจริง ๆ'} className="w-full rounded-xl border border-white/15 bg-slate-950/60 px-3 py-2 text-white outline-none" /></label>
          <label className="space-y-1 text-sm text-slate-200"><span>Reward Image Upload</span><input name="reward_image_upload" type="file" accept="image/*" onChange={handleImageUpload} className="w-full rounded-xl border border-white/15 bg-slate-950/60 px-3 py-2 text-white file:mr-3 file:rounded-md file:border-0 file:bg-cyan-500/20 file:px-2.5 file:py-1 file:text-xs file:text-cyan-100" /></label>
          {previewImageUrl ? <img src={previewImageUrl} alt="Reward preview" className="h-28 w-full rounded-lg object-cover" /> : null}
        </div>
        <button className="mt-4 w-full rounded-full bg-cyan-500/20 px-4 py-2 text-sm text-cyan-100">บันทึกรางวัล</button>
      </form>
    </div>
  );
}
