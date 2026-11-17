'use client';

import { FormEvent, ReactNode, useState } from 'react';
import { CalendarDays, Check, X } from 'lucide-react';
import { BLOOD_DONATION_TARGET, getBloodDonationPageProgress } from '@/lib/blood-donation/progress';
import { BloodDonationDashboardViewModel, BloodDonationEventRow } from '@/lib/blood-donation/types';

type Dialog = { kind: 'plan'; event: BloodDonationEventRow | null } | { kind: 'complete'; event: BloodDonationEventRow } | null;
type Props = { initialData: BloodDonationDashboardViewModel };
const TARGET = BLOOD_DONATION_TARGET;
const dateFormatter = new Intl.DateTimeFormat('th-TH', { day: 'numeric', month: 'long', year: 'numeric' });
const formatDate = (value: string | null) => value ? dateFormatter.format(new Date(`${value}T12:00:00`)) : '';
const todayLocal = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

async function apiRequest<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { cache: 'no-store', ...init });
  const json: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message = json && typeof json === 'object' && 'error' in json && typeof json.error === 'string'
      ? json.error : 'บันทึกข้อมูลไม่สำเร็จ กรุณาลองอีกครั้ง';
    throw new Error(message);
  }
  return json as T;
}

function selectRecords(events: BloodDonationEventRow[]) {
  const completed = events.filter((item) => item.status === 'completed')
    .sort((a, b) => (a.actual_date ?? a.created_at).localeCompare(b.actual_date ?? b.created_at));
  const planned = events.filter((item) => item.status === 'planned')
    .sort((a, b) => (a.planned_date ?? '').localeCompare(b.planned_date ?? ''));
  const visible = [...completed, ...planned].slice(0, TARGET);
  const ids = new Set(visible.map((item) => item.id));
  return { visible, other: events.filter((item) => !ids.has(item.id)), completedCount: completed.length };
}

export function BloodDonationDashboard({ initialData }: Props) {
  const [data, setData] = useState(initialData);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { visible, other } = selectRecords(data.events);
  const { completed: count, percentage: progress } = getBloodDonationPageProgress(data.events);
  const today = todayLocal();

  const save = async (action: () => Promise<unknown>) => {
    setBusy(true);
    setError(null);
    try {
      await action();
      setDialog(null);
      try {
        setData(await apiRequest<BloodDonationDashboardViewModel>('/api/blood-donation'));
      } catch {
        setError('บันทึกแล้ว แต่โหลดข้อมูลล่าสุดไม่สำเร็จ กรุณารีโหลดหน้า');
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'บันทึกข้อมูลไม่สำเร็จ กรุณาลองอีกครั้ง');
    } finally {
      setBusy(false);
    }
  };

  const startGoal = () => {
    const year = new Date().getFullYear();
    void save(() => apiRequest('/api/blood-donation/goals', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'บริจาคเลือดเพื่อช่วยเหลือผู้อื่น', target_count: TARGET, start_date: `${year}-01-01`, end_date: `${year}-12-31` })
    }));
  };

  const submitPlan = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!data.goal || dialog?.kind !== 'plan') return;
    const values = new FormData(event.currentTarget);
    const payload = {
      planned_date: String(values.get('planned_date') ?? ''),
      location: String(values.get('location') ?? '').trim(),
      note: String(values.get('note') ?? '').trim()
    };
    const selected = dialog.event;
    void save(() => apiRequest(selected
      ? `/api/blood-donation/events/${selected.id}/reschedule`
      : `/api/blood-donation/goals/${data.goal?.id}/events`, {
      method: selected ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(selected ? payload : { ...payload, mode: 'planned' })
    }));
  };

  const submitCompleted = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (dialog?.kind !== 'complete') return;
    const values = new FormData(event.currentTarget);
    const selected = dialog.event;
    void save(() => apiRequest(`/api/blood-donation/events/${selected.id}/complete`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actual_date: String(values.get('actual_date') ?? '') })
    }));
  };

  return <section className="mx-auto max-w-3xl pb-12">
    <div className="rounded-[28px] bg-white px-5 py-6 shadow-[0_18px_60px_-38px_rgba(30,64,175,0.28)] sm:px-8 sm:py-8">
      <header>
        <p className="text-xs font-semibold tracking-wide text-blue-600">เป้าหมายเพื่อสังคม</p>
        <h1 className="mt-2 text-2xl font-semibold leading-snug tracking-tight text-slate-950 sm:text-3xl">บริจาคเลือดเพื่อช่วยเหลือผู้อื่น</h1>
        <p className="mt-2 text-sm text-slate-500">{count === TARGET ? 'บริจาคเลือดครบ 3 ครั้ง' : 'เป้าหมาย: บริจาคเลือดให้ครบ 3 ครั้ง'}</p>
        <div className="mt-6 flex items-end justify-between gap-4">
          <div>
            {count === TARGET ? <p className="text-lg font-semibold text-blue-700">เป้าหมายสำเร็จแล้ว 🎉</p> : <p className="text-sm text-slate-500">บริจาคสำเร็จแล้ว</p>}
            <p className="mt-1 text-3xl font-semibold tabular-nums text-slate-950">{count} <span className="text-lg font-medium text-slate-400">/ {TARGET} ครั้ง</span></p>
          </div>
          <span className="pb-1 text-sm font-medium tabular-nums text-blue-700">{progress}%</span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-label="ความคืบหน้าการบริจาคเลือด" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full rounded-full bg-blue-600 transition-[width] duration-300" style={{ width: `${progress}%` }} />
        </div>
      </header>

      <div className="mt-8 border-t border-slate-100">
        {Array.from({ length: TARGET }, (_, index) => {
          const record = visible[index];
          const isCompleted = record?.status === 'completed';
          const isPlanned = record?.status === 'planned';
          const overdue = isPlanned && Boolean(record.planned_date && record.planned_date < today);
          return <article key={record?.id ?? `empty-${index}`} className="flex gap-4 border-b border-slate-100 py-5 last:border-0 sm:gap-5">
            <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${isCompleted ? 'bg-blue-600 text-white' : isPlanned ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-400'}`} aria-hidden="true">
              {isCompleted ? <Check size={19} strokeWidth={2.5} /> : isPlanned ? <CalendarDays size={18} /> : <span className="text-sm font-semibold">{index + 1}</span>}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <h2 className={`text-base font-semibold ${record ? 'text-slate-950' : 'text-slate-500'}`}>ครั้งที่ {index + 1}</h2>
                <span className={`text-xs font-medium ${isCompleted ? 'text-blue-700' : isPlanned ? 'text-slate-600' : 'text-slate-400'}`}>{isCompleted ? 'สำเร็จแล้ว' : isPlanned ? 'วางแผนแล้ว' : 'ยังไม่ได้วางแผน'}</span>
                {overdue ? <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] text-amber-700">เลยวันที่วางแผน</span> : null}
              </div>
              {record ? <>
                <p className={`mt-1.5 ${isPlanned ? 'text-base font-medium text-slate-900' : 'text-sm text-slate-500'}`}>{formatDate(isCompleted ? record.actual_date : record.planned_date)}</p>
                {record.location ? <p className="mt-1 text-sm text-slate-500">{record.location}</p> : null}
                {record.note ? <p className="mt-1 text-sm leading-relaxed text-slate-500">{record.note}</p> : null}
              </> : null}
              {isPlanned && record ? <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" disabled={busy} onClick={() => { setError(null); setDialog({ kind: 'complete', event: record }); }} className="min-h-10 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium !text-white transition hover:bg-blue-700 disabled:opacity-50">บันทึกว่าบริจาคแล้ว</button>
                <button type="button" disabled={busy} onClick={() => { setError(null); setDialog({ kind: 'plan', event: record }); }} className="min-h-10 rounded-xl px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 disabled:opacity-50">แก้ไขแผน</button>
              </div> : null}
              {!record && data.goal?.status === 'active' ? <button type="button" disabled={busy} onClick={() => { setError(null); setDialog({ kind: 'plan', event: null }); }} className="mt-3 min-h-10 rounded-xl bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 disabled:opacity-50">วางแผนครั้งที่ {index + 1}</button> : null}
            </div>
          </article>;
        })}
      </div>

      {!data.goal ? <button type="button" onClick={startGoal} disabled={busy} className="mt-2 min-h-11 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium !text-white disabled:opacity-50">เริ่มเป้าหมาย 3 ครั้ง</button> : null}
      {other.length > 0 ? <details className="mt-4 border-t border-slate-100 pt-4 text-sm text-slate-600">
        <summary className="cursor-pointer font-medium text-blue-700">รายการเดิมเพิ่มเติม ({other.length})</summary>
        <ul className="mt-3 space-y-2">{other.map((record) => <li key={record.id} className="rounded-xl bg-slate-50 px-4 py-3">
          <span className="font-medium text-slate-800">{record.status === 'completed' ? 'สำเร็จแล้ว' : record.status === 'planned' ? 'วางแผนแล้ว' : 'ไม่ได้ดำเนินการ'}</span>
          <span className="ml-2">{formatDate(record.actual_date ?? record.planned_date)}</span>
          {record.location ? <span className="ml-2">· {record.location}</span> : null}
          {record.note ? <p className="mt-1">{record.note}</p> : null}
          {record.status === 'planned' ? <div className="mt-2 flex flex-wrap gap-4">
            <button type="button" disabled={busy} onClick={() => { setError(null); setDialog({ kind: 'complete', event: record }); }} className="font-medium text-blue-700 disabled:opacity-50">บันทึกว่าบริจาคแล้ว</button>
            <button type="button" disabled={busy} onClick={() => { setError(null); setDialog({ kind: 'plan', event: record }); }} className="font-medium text-slate-600 disabled:opacity-50">แก้ไขแผน</button>
          </div> : null}
        </li>)}</ul>
      </details> : null}
      {error && !dialog ? <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
    </div>

    <DialogShell open={dialog !== null} onClose={() => { if (!busy) { setDialog(null); setError(null); } }}>
      {dialog?.kind === 'plan' ? <form onSubmit={submitPlan} className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-950">{dialog.event ? 'แก้ไขแผนบริจาค' : 'วางแผนบริจาค'}</h2>
        <Field name="planned_date" label="วันที่วางแผนบริจาค" type="date" defaultValue={dialog.event?.planned_date ?? ''} required />
        <Field name="location" label="สถานที่ (ไม่บังคับ)" defaultValue={dialog.event?.location ?? ''} />
        <Field name="note" label="หมายเหตุ (ไม่บังคับ)" defaultValue={dialog.event?.note ?? ''} />
        {error ? <p role="alert" className="text-sm text-red-700">{error}</p> : null}
        <button disabled={busy} className="min-h-11 w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium !text-white disabled:opacity-50">{busy ? 'กำลังบันทึก...' : 'บันทึกแผน'}</button>
      </form> : null}
      {dialog?.kind === 'complete' ? <form onSubmit={submitCompleted} className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-950">บันทึกว่าบริจาคแล้ว</h2>
        <p className="text-sm text-slate-500">ยืนยันวันที่บริจาคจริงเพื่อบันทึกความสำเร็จ</p>
        <Field name="actual_date" label="วันที่บริจาคจริง" type="date" defaultValue={dialog.event.planned_date ?? today} required />
        {error ? <p role="alert" className="text-sm text-red-700">{error}</p> : null}
        <button disabled={busy} className="min-h-11 w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium !text-white disabled:opacity-50">{busy ? 'กำลังบันทึก...' : 'ยืนยันว่าบริจาคแล้ว'}</button>
      </form> : null}
    </DialogShell>
  </section>;
}

function DialogShell({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }) {
  if (!open) return null;
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <div role="dialog" aria-modal="true" aria-label="บันทึกการบริจาคเลือด" className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl sm:p-6">
      <div className="mb-3 flex justify-end"><button type="button" onClick={onClose} aria-label="ปิด" className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"><X size={18} /></button></div>
      {children}
    </div>
  </div>;
}

function Field({ name, label, type = 'text', defaultValue, required = false }: { name: string; label: string; type?: string; defaultValue?: string; required?: boolean }) {
  return <label className="block text-sm font-medium text-slate-700">
    <span>{label}</span>
    <input key={`${name}-${defaultValue ?? ''}`} name={name} type={type} defaultValue={defaultValue} required={required} className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-base text-slate-950 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
  </label>;
}
