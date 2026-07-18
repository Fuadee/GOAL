'use client';

import { FormEvent, useEffect, useRef, useState, useTransition } from 'react';

import { saveSmvProjectAction } from '@/app/smv/actions';
import type { SmvProjectRow } from '@/lib/smv/types';

export function ProjectEditorModal({ isOpen, project, onClose, onSaved }: { isOpen: boolean; project: SmvProjectRow | null; onClose: () => void; onSaved: (project: SmvProjectRow) => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const submittingRef = useRef(false);

  useEffect(() => {
    if (!isOpen) return;
    setTitle(project?.title ?? '');
    setDescription(project?.description ?? '');
    setError(null);
  }, [isOpen, project]);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !submittingRef.current) onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submittingRef.current) return;
    if (!title.trim()) {
      setError('กรุณากรอกชื่อโปรเจกต์');
      return;
    }
    submittingRef.current = true;
    setError(null);
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await saveSmvProjectAction(formData);
      submittingRef.current = false;
      if (!result.success) {
        setError(result.message);
        return;
      }
      onSaved(result.project);
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/45 p-4 sm:p-6" onMouseDown={(event) => { if (event.target === event.currentTarget && !isPending) onClose(); }}>
      <form onSubmit={handleSubmit} onMouseDown={(event) => event.stopPropagation()} aria-labelledby="project-editor-title" className="my-auto flex max-h-[calc(100dvh-32px)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-5 sm:px-6">
          <div><h2 id="project-editor-title" className="text-xl font-semibold text-slate-950">{project ? 'แก้ไขโปรเจกต์' : 'สร้างโปรเจกต์'}</h2>{!project ? <p className="mt-1 text-sm text-slate-600">กำหนดเรื่องที่คุณต้องการพัฒนา</p> : null}</div>
          <button type="button" onClick={onClose} disabled={isPending} aria-label="ปิดหน้าต่างโปรเจกต์" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-white text-xl text-slate-700 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100 disabled:opacity-50">×</button>
        </header>
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5 sm:px-6">
          <input type="hidden" name="id" value={project?.id ?? ''} />
          <label className="block"><span className="text-sm font-medium text-slate-700">ชื่อโปรเจกต์ <span className="text-rose-600">*</span></span><input name="title" value={title} onChange={(event) => setTitle(event.target.value)} required maxLength={160} autoFocus placeholder="ชื่อโปรเจกต์ที่ต้องการพัฒนา" className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100" /></label>
          <label className="block"><span className="text-sm font-medium text-slate-700">รายละเอียด</span><textarea name="description" value={description} onChange={(event) => setDescription(event.target.value)} maxLength={2000} rows={5} placeholder="อธิบายสิ่งที่ต้องการเปลี่ยนแปลงหรือพัฒนา" className="mt-2 w-full resize-y rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm leading-6 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100" /></label>
          {error ? <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700">{error}</p> : null}
        </div>
        <footer className="flex flex-col-reverse gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:justify-end sm:px-6"><button type="button" onClick={onClose} disabled={isPending} className="min-h-11 rounded-xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-100 disabled:opacity-50">ยกเลิก</button><button type="submit" disabled={isPending} className="min-h-11 rounded-xl bg-[#12233f] px-5 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60">{isPending ? 'กำลังบันทึก...' : project ? 'บันทึกการแก้ไข' : 'สร้างโปรเจกต์'}</button></footer>
      </form>
    </div>
  );
}
