'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useRef, useState, useTransition } from 'react';

import { deleteSmvProjectMilestoneAction, saveSmvProjectMilestoneAction } from '@/app/smv/actions';
import type { SmvProjectMilestoneRow } from '@/lib/smv/types';

export function ProjectMilestones({ projectId, initialMilestones }: { projectId: string; initialMilestones: SmvProjectMilestoneRow[] }) {
  const [milestones, setMilestones] = useState(initialMilestones);
  const [editing, setEditing] = useState<SmvProjectMilestoneRow | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const submittingRef = useRef(false);
  const router = useRouter();

  const openCreate = () => {
    setEditing(null);
    setTitle('');
    setDescription('');
    setError(null);
    setIsModalOpen(true);
  };

  const openEdit = (milestone: SmvProjectMilestoneRow) => {
    setOpenMenuId(null);
    setEditing(milestone);
    setTitle(milestone.title);
    setDescription(milestone.description ?? '');
    setError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (isPending) return;
    setError(null);
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (!isModalOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !submittingRef.current) setIsModalOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isModalOpen]);

  useEffect(() => {
    const closeMenu = () => setOpenMenuId(null);
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submittingRef.current) return;
    if (!title.trim()) {
      setError('กรุณากรอกชื่อ Milestone');
      return;
    }
    submittingRef.current = true;
    setError(null);
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await saveSmvProjectMilestoneAction(formData);
      submittingRef.current = false;
      if (!result.success) {
        setError(result.message);
        return;
      }
      setMilestones((current) => editing
        ? current.map((item) => item.id === result.milestone.id ? result.milestone : item)
        : [...current, result.milestone]);
      setIsModalOpen(false);
      setEditing(null);
      setTitle('');
      setDescription('');
    });
  };

  const removeMilestone = (milestone: SmvProjectMilestoneRow) => {
    setOpenMenuId(null);
    if (!window.confirm(`ลบ Milestone “${milestone.title}” ใช่หรือไม่`)) return;
    setActionError(null);
    startTransition(async () => {
      const result = await deleteSmvProjectMilestoneAction(milestone.id, projectId);
      if (!result.success) {
        setActionError(result.message);
        return;
      }
      setMilestones((current) => current.filter((item) => item.id !== milestone.id));
    });
  };

  return (
    <section className="py-7 sm:py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Milestones</h2>
        <button type="button" onClick={openCreate} className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_20px_-14px_rgba(37,99,235,0.9)] transition-all duration-200 hover:bg-blue-700 hover:shadow-[0_14px_24px_-14px_rgba(37,99,235,0.9)] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100 sm:w-auto">+ เพิ่ม Milestone</button>
      </div>

      {actionError ? <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{actionError}</p> : null}

      {milestones.length === 0 ? (
        <div className="flex min-h-[36vh] flex-col items-center justify-center px-4 py-12 text-center">
          <h3 className="text-xl font-semibold text-slate-950">ยังไม่มี Milestone</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">เริ่มสร้างหมุดหมายแรกของโปรเจกต์นี้</p>
          <button type="button" onClick={openCreate} className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#12233f] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100">+ เพิ่ม Milestone</button>
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {milestones.map((milestone) => (
            <article
              key={milestone.id}
              role="button"
              tabIndex={0}
              aria-label={`เปิด Milestone ${milestone.title}`}
              onClick={() => router.push(`/smv/${projectId}/milestones/${milestone.id}`)}
              onKeyDown={(event) => {
                if (event.target !== event.currentTarget) return;
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  router.push(`/smv/${projectId}/milestones/${milestone.id}`);
                }
              }}
              className="group relative flex min-w-0 cursor-pointer items-start gap-4 rounded-[20px] border border-sky-200/80 bg-white p-5 pr-24 shadow-[0_14px_32px_-28px_rgba(14,116,144,0.45)] transition-all duration-200 hover:-translate-y-1 hover:border-blue-500 hover:bg-sky-50/40 hover:shadow-[0_22px_42px_-28px_rgba(14,116,144,0.55)] active:scale-[0.99] focus-visible:-translate-y-0.5 focus-visible:border-blue-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100 sm:items-center sm:p-6 sm:pr-28"
            >
              <span aria-hidden="true" className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border text-lg font-bold transition-transform duration-200 group-hover:scale-105 sm:mt-0 sm:h-12 sm:w-12 ${milestone.is_completed ? 'border-emerald-200 bg-emerald-100 text-emerald-600' : 'border-sky-200 bg-sky-100 text-sky-600'}`}>{milestone.is_completed ? '✓' : '◆'}</span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className={`break-words text-lg font-semibold ${milestone.is_completed ? 'text-slate-600' : 'text-slate-950'}`}>{milestone.title}</h3>
                  <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${milestone.is_completed ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-blue-200 bg-blue-50 text-blue-700'}`}>{milestone.is_completed ? 'Completed' : 'In Progress'}</span>
                </div>
                {milestone.description ? <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">{milestone.description}</p> : null}
              </div>
              <span aria-hidden="true" className="absolute right-5 top-1/2 -translate-y-1/2 text-2xl text-sky-500 transition-transform duration-200 group-hover:translate-x-1">›</span>
              <div className="absolute right-14 top-3 sm:right-16 sm:top-4">
                <button type="button" onClick={(event) => { event.stopPropagation(); setOpenMenuId((current) => current === milestone.id ? null : milestone.id); }} aria-label={`จัดการ Milestone ${milestone.title}`} aria-expanded={openMenuId === milestone.id} className="flex h-10 w-10 items-center justify-center rounded-full text-xl text-slate-600 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100">⋮</button>
                {openMenuId === milestone.id ? (
                  <div onClick={(event) => event.stopPropagation()} className="absolute right-0 top-11 z-20 w-36 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl">
                    <button type="button" onClick={() => openEdit(milestone)} className="block w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50">แก้ไข</button>
                    <button type="button" onClick={() => removeMilestone(milestone)} className="block w-full px-4 py-2.5 text-left text-sm text-rose-600 hover:bg-rose-50">ลบ</button>
                  </div>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}

      {isModalOpen ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/45 p-4 sm:p-6" onMouseDown={(event) => { if (event.target === event.currentTarget) closeModal(); }}>
          <form onSubmit={handleSubmit} onMouseDown={(event) => event.stopPropagation()} aria-labelledby="milestone-modal-title" className="my-auto flex max-h-[calc(100dvh-32px)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-5 sm:px-6">
              <h2 id="milestone-modal-title" className="text-xl font-semibold text-slate-950">{editing ? 'แก้ไข Milestone' : 'เพิ่ม Milestone'}</h2>
              <button type="button" onClick={closeModal} disabled={isPending} aria-label="ปิดหน้าต่าง Milestone" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-300 text-xl text-slate-700 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100 disabled:opacity-50">×</button>
            </header>
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5 sm:px-6">
              <input type="hidden" name="id" value={editing?.id ?? ''} />
              <input type="hidden" name="project_id" value={projectId} />
              <label className="block"><span className="text-sm font-medium text-slate-700">ชื่อ Milestone <span className="text-rose-600">*</span></span><input name="title" value={title} onChange={(event) => setTitle(event.target.value)} required maxLength={160} autoFocus className="mt-2 h-11 w-full rounded-xl border border-slate-300 px-3.5 text-sm text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" /></label>
              <label className="block"><span className="text-sm font-medium text-slate-700">รายละเอียด</span><textarea name="description" value={description} onChange={(event) => setDescription(event.target.value)} maxLength={2000} rows={5} className="mt-2 w-full resize-y rounded-xl border border-slate-300 px-3.5 py-3 text-sm leading-6 text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" /></label>
              {error ? <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700">{error}</p> : null}
            </div>
            <footer className="flex flex-col-reverse gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
              <button type="button" onClick={closeModal} disabled={isPending} className="min-h-11 rounded-xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-100 disabled:opacity-50">ยกเลิก</button>
              <button type="submit" disabled={isPending} className="min-h-11 rounded-xl bg-[#12233f] px-5 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60">{isPending ? 'กำลังบันทึก...' : editing ? 'บันทึก' : 'สร้าง Milestone'}</button>
            </footer>
          </form>
        </div>
      ) : null}
    </section>
  );
}
