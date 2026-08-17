'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Mail, X } from 'lucide-react';
import { createCompletedInnovationAction, updateInnovationSupabaseEmailAction } from '@/app/innovation/actions';
import type { InnovationCardViewModel } from '@/lib/innovation/types';
import { innovationUi } from '@/components/innovation/uiTokens';

const updatedDateFormatter = new Intl.DateTimeFormat('th-TH-u-ca-buddhist', {
  day: 'numeric',
  month: 'short',
  year: 'numeric'
});

export function CompletedAppsSection({ apps }: { apps: InnovationCardViewModel[] }) {
  const router = useRouter();
  const [isCreatingInnovation, setIsCreatingInnovation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [createdInnovationId, setCreatedInnovationId] = useState<string | null>(null);
  const [selectedApp, setSelectedApp] = useState<InnovationCardViewModel | null>(null);
  const [supabaseEmail, setSupabaseEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isEmailPending, startEmailTransition] = useTransition();

  useEffect(() => {
    if (!createdInnovationId || !apps.some((app) => app.id === createdInnovationId)) {
      return;
    }

    document.getElementById(`completed-innovation-${createdInnovationId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const timer = window.setTimeout(() => setCreatedInnovationId(null), 2800);
    return () => window.clearTimeout(timer);
  }, [apps, createdInnovationId]);

  useEffect(() => {
    if (!selectedApp) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedApp(null);
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedApp]);

  const handleCreateInnovation = (formData: FormData) => {
    setError(null);
    setSuccessMessage(null);
    startTransition(async () => {
      const result = await createCompletedInnovationAction(formData);
      if (!result.success) {
        setError(result.message);
        return;
      }

      setCreatedInnovationId(result.innovationId ?? null);
      setSuccessMessage(result.message);
      setIsCreatingInnovation(false);
      router.refresh();
    });
  };

  const openAppDetails = (app: InnovationCardViewModel) => {
    setSelectedApp(app);
    setSupabaseEmail(app.supabase_email ?? '');
    setEmailError(null);
  };

  const handleSaveSupabaseEmail = (formData: FormData) => {
    if (!selectedApp) {
      return;
    }

    setEmailError(null);
    startEmailTransition(async () => {
      const result = await updateInnovationSupabaseEmailAction(selectedApp.id, formData);
      if (!result.success) {
        setEmailError(result.message);
        return;
      }

      setSuccessMessage(result.message);
      setSelectedApp(null);
      router.refresh();
    });
  };

  return <section className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-[0_20px_44px_-34px_rgba(15,23,42,0.3)] sm:p-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
          <CheckCircle2 aria-hidden="true" className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-950 sm:text-2xl">แอปที่สร้างสำเร็จแล้ว ({apps.length})</h2>
          <p className="mt-1 text-sm text-slate-500">ผลงานที่สร้างและพัฒนาจนสำเร็จ</p>
        </div>
      </div>
      <button type="button" onClick={() => setIsCreatingInnovation(true)} className={`${innovationUi.primaryButton} w-full shrink-0 !text-white sm:w-auto`}>+ เพิ่ม Innovation</button>
    </div>

    {successMessage ? <p className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700" role="status">{successMessage}</p> : null}

    {isCreatingInnovation ? <div className="mt-5 rounded-[22px] border border-slate-200 bg-slate-50/80 p-4">
      <h3 className="text-sm font-semibold text-slate-900">เพิ่มแอปที่สร้างสำเร็จแล้ว</h3>
      <form className="mt-3 grid gap-3" action={handleCreateInnovation}>
        <input type="text" name="title" required placeholder="ชื่อแอป" className={innovationUi.input} />
        <textarea name="description" rows={3} placeholder="รายละเอียดสั้น ๆ ว่าแอปนี้ใช้ทำอะไร" className={innovationUi.input} />
        <textarea name="benefit" rows={2} placeholder="ผลลัพธ์หรือประโยชน์ที่ได้รับ (ไม่บังคับ)" className={innovationUi.input} />
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        <div className="flex flex-wrap gap-2">
          <button type="submit" disabled={isPending} className={innovationUi.primaryButton}>{isPending ? 'กำลังเพิ่ม...' : 'เพิ่มเป็นแอปที่สำเร็จแล้ว'}</button>
          <button type="button" onClick={() => setIsCreatingInnovation(false)} className={innovationUi.secondaryButton}>ยกเลิก</button>
        </div>
      </form>
    </div> : null}

    {apps.length === 0 ? <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-9 text-center text-sm text-slate-500">ยังไม่มีแอปที่สร้างสำเร็จ</div> : <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {apps.map((app, index) => <button type="button" id={`completed-innovation-${app.id}`} key={app.id} onClick={() => openAppDetails(app)} aria-haspopup="dialog" className={`group relative flex min-h-[230px] flex-col overflow-hidden rounded-[22px] border bg-white p-5 text-left shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-blue-100 ${createdInnovationId === app.id ? 'border-blue-400 ring-4 ring-blue-100' : 'border-slate-200'}`}>
        <div className="absolute inset-x-0 top-0 h-1 bg-blue-600" />
        <div className="flex items-start justify-between gap-3">
          <span className="font-numeric text-xs font-semibold tracking-[0.16em] text-blue-600">APP {String(index + 1).padStart(2, '0')}</span>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
            <CheckCircle2 aria-hidden="true" className="h-3.5 w-3.5" />
            สร้างสำเร็จแล้ว
          </span>
        </div>
        <h3 className="mt-4 break-words text-xl font-semibold leading-snug text-slate-950">{app.title}</h3>
        {app.description ? <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{app.description}</p> : null}
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5 text-sm text-slate-600">
          <Mail aria-hidden="true" className="h-4 w-4 shrink-0 text-blue-600" />
          <span className={`truncate ${app.supabase_email ? 'font-medium text-slate-700' : 'text-slate-500'}`}>
            {app.supabase_email ?? 'ยังไม่ได้ระบุ Email'}
          </span>
        </div>
        <p className="mt-auto pt-5 text-xs text-slate-500">อัปเดตล่าสุด {updatedDateFormatter.format(new Date(app.updated_at))}</p>
      </button>)}
    </div>}

    {selectedApp ? <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/55 px-4 py-8 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isEmailPending) {
          setSelectedApp(null);
        }
      }}
    >
      <div className="w-full max-w-md rounded-[24px] border border-white/60 bg-white p-5 shadow-2xl sm:p-6" role="dialog" aria-modal="true" aria-labelledby="supabase-email-modal-title">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">Innovation</p>
            <h2 id="supabase-email-modal-title" className="mt-1 break-words text-xl font-semibold text-slate-950">{selectedApp.title}</h2>
          </div>
          <button type="button" onClick={() => setSelectedApp(null)} disabled={isEmailPending} aria-label="ปิด" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200 disabled:opacity-50">
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>

        <form action={handleSaveSupabaseEmail} className="mt-6">
          <label htmlFor="supabaseEmail" className="block text-sm font-semibold text-slate-800">Supabase Email</label>
          <div className="relative mt-2">
            <Mail aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="supabaseEmail"
              name="supabaseEmail"
              type="email"
              inputMode="email"
              autoComplete="email"
              autoFocus
              maxLength={320}
              value={supabaseEmail}
              onChange={(event) => setSupabaseEmail(event.target.value)}
              placeholder="ยังไม่ได้ระบุ Email"
              className={`${innovationUi.input} w-full pl-10`}
            />
          </div>
          {!supabaseEmail ? <p className="mt-2 text-sm text-slate-500">ยังไม่ได้ระบุ Email</p> : null}
          {emailError ? <p className="mt-3 text-sm font-medium text-rose-600" role="alert">{emailError}</p> : null}

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={() => setSelectedApp(null)} disabled={isEmailPending} className={innovationUi.secondaryButton}>ยกเลิก</button>
            <button type="submit" disabled={isEmailPending} className={innovationUi.primaryButton}>{isEmailPending ? 'กำลังบันทึก...' : 'บันทึก Email'}</button>
          </div>
        </form>
      </div>
    </div> : null}
  </section>;
}
