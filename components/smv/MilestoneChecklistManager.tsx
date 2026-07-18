'use client';

import { FormEvent, useEffect, useMemo, useRef, useState, useTransition } from 'react';

import { deleteSmvMilestoneChecklistAction, saveSmvMilestoneChecklistAction, toggleSmvMilestoneChecklistAction } from '@/app/smv/actions';
import type { SmvMilestoneChecklistRow } from '@/lib/smv/types';

export function MilestoneChecklistManager({ projectId, milestoneId, projectTitle, milestoneTitle, milestoneDescription, initialChecklists }: { projectId: string; milestoneId: string; projectTitle: string; milestoneTitle: string; milestoneDescription: string | null; initialChecklists: SmvMilestoneChecklistRow[] }) {
  const [checklists, setChecklists] = useState(initialChecklists);
  const [editing, setEditing] = useState<SmvMilestoneChecklistRow | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const submittingRef = useRef(false);

  const completedCount = useMemo(() => checklists.filter((item) => item.is_completed).length, [checklists]);
  const isMilestoneCompleted = checklists.length > 0 && completedCount === checklists.length;
  const progress = checklists.length > 0 ? Math.round((completedCount / checklists.length) * 100) : 0;

  const openCreate = () => {
    setEditing(null);
    setTitle('');
    setDescription('');
    setError(null);
    setIsModalOpen(true);
  };

  const openEdit = (item: SmvMilestoneChecklistRow) => {
    setOpenMenuId(null);
    setEditing(item);
    setTitle(item.title);
    setDescription(item.description ?? '');
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
      setError('กรุณากรอกชื่อรายการ');
      return;
    }
    submittingRef.current = true;
    setError(null);
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await saveSmvMilestoneChecklistAction(formData);
      submittingRef.current = false;
      if (!result.success) {
        setError(result.message);
        return;
      }
      setChecklists((current) => editing
        ? current.map((item) => item.id === result.checklist.id ? result.checklist : item)
        : [...current, result.checklist]);
      setIsModalOpen(false);
      setEditing(null);
      setTitle('');
      setDescription('');
    });
  };

  const toggleItem = (item: SmvMilestoneChecklistRow) => {
    const nextValue = !item.is_completed;
    setActionError(null);
    setChecklists((current) => current.map((currentItem) => currentItem.id === item.id ? { ...currentItem, is_completed: nextValue } : currentItem));
    startTransition(async () => {
      const result = await toggleSmvMilestoneChecklistAction(item.id, milestoneId, projectId, nextValue);
      if (!result.success) {
        setChecklists((current) => current.map((currentItem) => currentItem.id === item.id ? { ...currentItem, is_completed: item.is_completed } : currentItem));
        setActionError(result.message);
        return;
      }
      setChecklists((current) => current.map((currentItem) => currentItem.id === result.checklist.id ? result.checklist : currentItem));
    });
  };

  const removeItem = (item: SmvMilestoneChecklistRow) => {
    setOpenMenuId(null);
    if (!window.confirm(`ลบรายการ “${item.title}” ใช่หรือไม่`)) return;
    setActionError(null);
    startTransition(async () => {
      const result = await deleteSmvMilestoneChecklistAction(item.id, milestoneId, projectId);
      if (!result.success) {
        setActionError(result.message);
        return;
      }
      setChecklists((current) => current.filter((currentItem) => currentItem.id !== item.id));
    });
  };

  return (
    <>
    <header className="mt-6">
      <p className="text-sm font-medium text-blue-600">{projectTitle}</p>
      <div className="mt-2 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
        <h1 className="break-words text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">{milestoneTitle}</h1>
        <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${isMilestoneCompleted ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-blue-200 bg-blue-50 text-blue-700'}`}>{isMilestoneCompleted ? 'Completed' : 'In Progress'}</span>
      </div>
      {milestoneDescription ? <p className="mt-3 max-w-3xl whitespace-pre-wrap break-words text-sm leading-7 text-slate-600 sm:text-base">{milestoneDescription}</p> : null}
    </header>
    <section className="mt-8 border-t border-slate-200 pt-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Checklist</h2>
          <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${isMilestoneCompleted ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-blue-200 bg-blue-50 text-blue-700'}`}>{isMilestoneCompleted ? 'Completed' : 'In Progress'}</span>
        </div>
        <button type="button" onClick={openCreate} className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[#12233f] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100 sm:w-auto">+ เพิ่มรายการ</button>
      </div>

      <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
        <div className="flex items-center justify-between gap-4 text-sm"><p className="font-medium text-slate-700">ทำสำเร็จแล้ว {completedCount} จาก {checklists.length} รายการ</p><span className="text-slate-500">{progress}%</span></div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200"><div className={`h-full rounded-full transition-all ${isMilestoneCompleted ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${progress}%` }} /></div>
      </div>

      {actionError ? <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{actionError}</p> : null}

      {checklists.length === 0 ? (
        <div className="flex min-h-[30vh] flex-col items-center justify-center px-4 py-10 text-center">
          <h3 className="text-xl font-semibold text-slate-950">ยังไม่มีรายการ</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">เพิ่มสิ่งที่ต้องทำเพื่อทำให้ Milestone นี้สำเร็จ</p>
          <button type="button" onClick={openCreate} className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#12233f] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100">+ เพิ่มรายการแรก</button>
        </div>
      ) : (
        <div className="mt-4 space-y-2">
          {checklists.map((item) => (
            <article key={item.id} className="relative flex min-w-0 items-start gap-3 rounded-xl border border-slate-200 bg-white px-4 py-4 pr-14 shadow-[0_12px_24px_-24px_rgba(15,23,42,0.5)] sm:items-center sm:px-5 sm:pr-16">
              <button type="button" onClick={() => toggleItem(item)} disabled={isPending} role="checkbox" aria-checked={item.is_completed} aria-label={`${item.is_completed ? 'ยกเลิกการทำเสร็จ' : 'ทำเครื่องหมายว่าเสร็จแล้ว'} ${item.title}`} className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border-2 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100 disabled:opacity-60 sm:mt-0 ${item.is_completed ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 bg-white text-transparent hover:border-blue-400'}`}>✓</button>
              <div className={`min-w-0 flex-1 transition ${item.is_completed ? 'opacity-60' : ''}`}>
                <h3 className={`break-words text-sm font-semibold text-slate-900 sm:text-base ${item.is_completed ? 'line-through decoration-slate-400' : ''}`}>{item.title}</h3>
                {item.description ? <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-5 text-slate-600">{item.description}</p> : null}
              </div>
              <div className="absolute right-2 top-2 sm:right-3 sm:top-3">
                <button type="button" onClick={(event) => { event.stopPropagation(); setOpenMenuId((current) => current === item.id ? null : item.id); }} aria-label={`จัดการรายการ ${item.title}`} aria-expanded={openMenuId === item.id} className="flex h-10 w-10 items-center justify-center rounded-full text-xl text-slate-600 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100">⋮</button>
                {openMenuId === item.id ? <div onClick={(event) => event.stopPropagation()} className="absolute right-0 top-11 z-20 w-36 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl"><button type="button" onClick={() => openEdit(item)} className="block w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50">แก้ไข</button><button type="button" onClick={() => removeItem(item)} className="block w-full px-4 py-2.5 text-left text-sm text-rose-600 hover:bg-rose-50">ลบ</button></div> : null}
              </div>
            </article>
          ))}
        </div>
      )}

      {isModalOpen ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/45 p-4 sm:p-6" onMouseDown={(event) => { if (event.target === event.currentTarget) closeModal(); }}>
          <form onSubmit={handleSubmit} onMouseDown={(event) => event.stopPropagation()} aria-labelledby="checklist-modal-title" className="my-auto flex max-h-[calc(100dvh-32px)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-5 sm:px-6"><h2 id="checklist-modal-title" className="text-xl font-semibold text-slate-950">{editing ? 'แก้ไขรายการ' : 'เพิ่มรายการ'}</h2><button type="button" onClick={closeModal} disabled={isPending} aria-label="ปิดหน้าต่างรายการ" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-300 text-xl text-slate-700 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100 disabled:opacity-50">×</button></header>
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5 sm:px-6">
              <input type="hidden" name="id" value={editing?.id ?? ''} /><input type="hidden" name="project_id" value={projectId} /><input type="hidden" name="milestone_id" value={milestoneId} />
              <label className="block"><span className="text-sm font-medium text-slate-700">ชื่อรายการ <span className="text-rose-600">*</span></span><input name="title" value={title} onChange={(event) => setTitle(event.target.value)} required maxLength={160} autoFocus className="mt-2 h-11 w-full rounded-xl border border-slate-300 px-3.5 text-sm text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" /></label>
              <label className="block"><span className="text-sm font-medium text-slate-700">รายละเอียด</span><textarea name="description" value={description} onChange={(event) => setDescription(event.target.value)} maxLength={2000} rows={5} className="mt-2 w-full resize-y rounded-xl border border-slate-300 px-3.5 py-3 text-sm leading-6 text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" /></label>
              {error ? <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700">{error}</p> : null}
            </div>
            <footer className="flex flex-col-reverse gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:justify-end sm:px-6"><button type="button" onClick={closeModal} disabled={isPending} className="min-h-11 rounded-xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-100 disabled:opacity-50">ยกเลิก</button><button type="submit" disabled={isPending} className="min-h-11 rounded-xl bg-[#12233f] px-5 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60">{isPending ? 'กำลังบันทึก...' : editing ? 'บันทึกการแก้ไข' : 'เพิ่มรายการ'}</button></footer>
          </form>
        </div>
      ) : null}
    </section>
    </>
  );
}
