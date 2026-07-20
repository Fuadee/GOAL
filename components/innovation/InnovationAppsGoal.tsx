'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createInnovationAppAction, updateInnovationAppAction } from '@/app/innovation/[id]/actions';
import { InnovationAppRow, InnovationAppStatus, InnovationRow } from '@/lib/innovation/types';

const TARGET_APP_COUNT = 10;
const dateFormatter = new Intl.DateTimeFormat('th-TH-u-ca-buddhist', { dateStyle: 'medium' });

export function InnovationAppsGoal({ innovation, apps }: { innovation: InnovationRow; apps: InnovationAppRow[] }) {
  const router = useRouter();
  const [editingApp, setEditingApp] = useState<InnovationAppRow | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const completedAppCount = apps.filter((app) => app.status === 'completed').length;
  const progress = Math.min(Math.max((completedAppCount / TARGET_APP_COUNT) * 100, 0), 100);

  const openCreate = () => {
    setEditingApp(null);
    setModalOpen(true);
  };

  const openEdit = (app: InnovationAppRow) => {
    setEditingApp(app);
    setModalOpen(true);
  };

  return <section className="page-container space-y-6">
    <section className="overflow-hidden rounded-[28px] border border-blue-200 bg-gradient-to-br from-white via-blue-50/50 to-sky-100/60 p-5 shadow-[0_24px_60px_-38px_rgba(37,99,235,0.5)] sm:p-7 lg:p-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold text-blue-700">เป้าหมายนวัตกรรม</p>
          <h1 className="mt-2 text-2xl font-semibold leading-tight text-slate-950 sm:text-3xl">สร้างแอปให้ครบ 10 แอป</h1>
          <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">หน้ารวบรวมและติดตามแอปที่กำลังพัฒนา รวมถึงแอปที่สร้างสำเร็จแล้ว</p>
        </div>
        <button type="button" onClick={openCreate} className="theme-button-primary w-full shrink-0 !text-white sm:w-auto">+ เพิ่มแอปใหม่</button>
      </div>

      <div className="mt-6 rounded-2xl border border-blue-100 bg-white/85 p-4 shadow-sm sm:p-5">
        <div className="flex items-end justify-between gap-4">
          <div><p className="text-sm font-medium text-slate-600">ความคืบหน้า</p><p className="mt-1 text-xl font-semibold text-slate-950">สร้างแล้ว {completedAppCount} / {TARGET_APP_COUNT} แอป</p></div>
          <span className="font-numeric text-xl font-semibold text-blue-700">{progress.toFixed(0)}%</span>
        </div>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-blue-100" role="progressbar" aria-label="ความคืบหน้าการสร้างแอป" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
          <div className="h-full rounded-full bg-blue-600 transition-[width] duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </section>

    <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_45px_-32px_rgba(15,23,42,0.3)] sm:p-6">
      <div className="flex items-center justify-between gap-4"><div><h2 className="text-xl font-semibold text-slate-950">รายการแอป</h2><p className="mt-1 text-sm text-slate-500">แอปทั้งหมดที่เชื่อมโยงกับเป้าหมายนี้</p></div></div>
      {apps.length === 0 ? <div className="py-10 text-center sm:py-14">
        <h3 className="text-lg font-semibold text-slate-900">ยังไม่มีแอปที่บันทึกไว้ เริ่มสร้างแอปแรกของคุณได้เลย</h3>
        <button type="button" onClick={openCreate} className="theme-button-primary mt-5 !text-white">+ เพิ่มแอปใหม่</button>
      </div> : <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
        {apps.map((app) => <article key={app.id} className="flex min-h-[190px] flex-col rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md">
          <div className="flex items-start justify-between gap-3"><h3 className="min-w-0 break-words text-lg font-semibold text-slate-950">{app.title}</h3><span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${app.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>{app.status === 'completed' ? 'สร้างสำเร็จแล้ว' : 'กำลังสร้าง'}</span></div>
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{app.description || 'ยังไม่มีรายละเอียด'}</p>
          <div className="mt-auto flex items-end justify-between gap-3 pt-5"><p className="text-xs text-slate-500">อัปเดตล่าสุด {dateFormatter.format(new Date(app.updated_at))}</p><button type="button" onClick={() => openEdit(app)} className="theme-button-secondary shrink-0">แก้ไข</button></div>
        </article>)}
      </div>}
    </section>

    {modalOpen ? <InnovationAppModal innovationId={innovation.id} app={editingApp} onClose={() => setModalOpen(false)} onSaved={() => { setModalOpen(false); router.refresh(); }} /> : null}
  </section>;
}

function InnovationAppModal({ innovationId, app, onClose, onSaved }: { innovationId: string; app: InnovationAppRow | null; onClose: () => void; onSaved: () => void }) {
  const [title, setTitle] = useState(app?.title ?? '');
  const [description, setDescription] = useState(app?.description ?? '');
  const [status, setStatus] = useState<InnovationAppStatus>(app?.status ?? 'building');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape' && !submitting) onClose(); };
    window.addEventListener('keydown', onKeyDown);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener('keydown', onKeyDown); };
  }, [onClose, submitting]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    if (!title.trim()) { setError('กรุณากรอกชื่อแอป'); return; }
    setSubmitting(true);
    setError(null);
    const formData = new FormData();
    formData.set('title', title.trim());
    formData.set('description', description.trim());
    formData.set('status', status);
    const result = app
      ? await updateInnovationAppAction(innovationId, app.id, formData)
      : await createInnovationAppAction(innovationId, formData);
    setSubmitting(false);
    if (!result.success) { setError(result.message); return; }
    onSaved();
  };

  return <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-950/55 px-4 py-8 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="innovation-app-modal-title">
    <button type="button" aria-label="ปิดหน้าต่าง" className="fixed inset-0 h-full w-full cursor-default" onClick={() => { if (!submitting) onClose(); }} />
    <div className="relative mx-auto flex min-h-full max-w-lg items-center justify-center">
      <form onSubmit={submit} className="relative w-full rounded-[26px] border border-slate-200 bg-white p-5 shadow-2xl sm:p-6">
        <div className="flex items-start justify-between gap-4"><div><h2 id="innovation-app-modal-title" className="text-xl font-semibold text-slate-950">{app ? 'แก้ไขแอป' : 'เพิ่มแอปใหม่'}</h2><p className="mt-1 text-sm text-slate-500">บันทึกข้อมูลลงในเป้าหมายนวัตกรรมนี้</p></div><button type="button" aria-label="ปิด" disabled={submitting} onClick={onClose} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xl text-slate-600 hover:bg-slate-200 disabled:opacity-50">×</button></div>
        <div className="mt-6 space-y-4">
          <label className="block text-sm font-medium text-slate-700">ชื่อแอป <span className="text-rose-600">*</span><input value={title} onChange={(event) => setTitle(event.target.value)} required maxLength={160} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-950 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></label>
          <label className="block text-sm font-medium text-slate-700">รายละเอียด<textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={4} className="mt-2 w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-slate-950 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></label>
          <label className="block text-sm font-medium text-slate-700">สถานะ<select value={status} onChange={(event) => setStatus(event.target.value as InnovationAppStatus)} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"><option value="building">กำลังสร้าง</option><option value="completed">สร้างสำเร็จแล้ว</option></select></label>
          {error ? <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}
        </div>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" disabled={submitting} onClick={onClose} className="theme-button-secondary disabled:opacity-50">ยกเลิก</button><button type="submit" disabled={submitting} className="theme-button-primary !text-white disabled:cursor-not-allowed disabled:opacity-60">{submitting ? 'กำลังบันทึก...' : app ? 'บันทึกการแก้ไข' : 'เพิ่มแอป'}</button></div>
      </form>
    </div>
  </div>;
}
