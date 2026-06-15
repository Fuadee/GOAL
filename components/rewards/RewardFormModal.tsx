'use client';

import { ChangeEvent, useEffect, useState } from 'react';

type Props = {
  open: boolean;
  levelId: string;
  defaultValues?: { title?: string | null; description?: string | null; emotionalCopy?: string | null; imageUrl?: string | null };
  onClose: () => void;
  onSubmit: (fd: FormData) => void;
};

export function RewardFormModal({ open, levelId, defaultValues, onClose, onSubmit }: Props) {
  const [previewImageUrl, setPreviewImageUrl] = useState(defaultValues?.imageUrl ?? '');
  const [selectedFileName, setSelectedFileName] = useState('');
  const [isEntered, setIsEntered] = useState(false);
  const uploadInputId = `reward-image-upload-${levelId}`;

  useEffect(() => {
    setPreviewImageUrl(defaultValues?.imageUrl ?? '');
    setSelectedFileName('');
  }, [defaultValues?.imageUrl, open]);

  useEffect(() => {
    if (!open) {
      setIsEntered(false);
      return;
    }

    const frame = requestAnimationFrame(() => setIsEntered(true));
    const previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = previousBodyOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, open]);

  if (!open) return null;

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setSelectedFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => setPreviewImageUrl(typeof reader.result === 'string' ? reader.result : '');
    reader.readAsDataURL(file);
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-[rgba(15,23,42,0.35)]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <form
        action={onSubmit}
        onMouseDown={(event) => event.stopPropagation()}
        className={`fixed left-1/2 top-1/2 z-[110] flex max-h-[calc(100dvh_-_96px)] w-[calc(100vw_-_32px)] max-w-[640px] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-[0_24px_64px_-38px_rgba(15,23,42,0.42)] transition duration-[220ms] ease-out sm:w-[560px] ${isEntered ? 'scale-100 opacity-100' : 'scale-[0.98] opacity-0'}`}
      >
        <input type="hidden" name="level_id" value={levelId} />

        <div className="sticky top-0 z-[120] flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-6 py-6">
          <div>
            <h4 className="text-xl font-semibold tracking-tight text-slate-950">รางวัลของคุณ</h4>
            <p className="mt-2 text-sm leading-6 text-slate-500">ตั้งชื่อและเลือกรูปที่ทำให้เป้าหมายมีความหมาย</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="ปิดฟอร์มรางวัล"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-white text-2xl leading-none text-slate-900 transition hover:bg-slate-100 hover:text-slate-950 focus:outline-none focus:ring-4 focus:ring-blue-100"
          >
            ×
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-4">
          <label className="block space-y-3">
            <span className="text-sm font-medium text-slate-600">ชื่อรางวัล</span>
            <input
              name="title"
              required
              defaultValue={defaultValues?.title ?? 'รางวัล'}
              className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-base font-medium text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </label>

          <label className="block space-y-3">
            <span className="text-sm font-medium text-slate-600">คำอธิบายรางวัล</span>
            <textarea
              name="description"
              defaultValue={defaultValues?.description ?? ''}
              rows={2}
              className="w-full resize-none rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              placeholder="ให้รางวัลกับตัวเองเมื่อทำภารกิจสำเร็จ"
            />
          </label>

          <label className="block space-y-3">
            <span className="text-sm font-medium text-slate-600">ข้อความปลดล็อก</span>
            <textarea
              name="emotional_copy"
              defaultValue={defaultValues?.emotionalCopy ?? ''}
              rows={2}
              className="w-full resize-none rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              placeholder="ปลดล็อกเมื่อเป้าหมายนี้สำเร็จ"
            />
          </label>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <label htmlFor={uploadInputId} className="text-sm font-medium text-slate-600">รูปภาพรางวัล</label>
              <label
                htmlFor={uploadInputId}
                className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-blue-100"
              >
                เลือกรูป
              </label>
            </div>
            <input
              id={uploadInputId}
              name="reward_image_upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="sr-only"
            />
            <input type="hidden" name="image_url" value={previewImageUrl} />

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-2 shadow-[0_12px_30px_-24px_rgba(15,23,42,0.45)]">
              {previewImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewImageUrl} alt="ตัวอย่างรางวัล" className="h-[120px] w-full rounded-xl object-cover" />
              ) : (
                <label
                  htmlFor={uploadInputId}
                  className="flex h-[120px] w-full cursor-pointer items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-3 text-center text-sm text-slate-500 transition hover:border-blue-300 hover:bg-blue-50/50"
                >
                  เพิ่มรูปตัวอย่างรางวัล
                </label>
              )}
            </div>
            <p className="truncate text-xs leading-5 text-slate-500">
              {selectedFileName ? `ไฟล์ที่เลือก: ${selectedFileName}` : 'ยังไม่ได้เลือกรูป'}
            </p>
          </div>
        </div>

        <div className="sticky bottom-0 z-[120] flex items-center gap-3 border-t border-slate-200 bg-white px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="h-11 flex-1 rounded-xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-100"
          >
            ยกเลิก
          </button>
          <button className="h-11 flex-1 rounded-xl bg-[#12233f] px-5 text-sm font-semibold text-white shadow-[0_14px_28px_-18px_rgba(15,23,42,0.72)] transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-100 active:translate-y-px">
            บันทึกรางวัล
          </button>
        </div>
      </form>
    </div>
  );
}
