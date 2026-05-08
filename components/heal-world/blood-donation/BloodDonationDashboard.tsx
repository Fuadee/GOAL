'use client';

import { FormEvent, ReactNode, useMemo, useState } from 'react';

import {
  BloodDonationPlanDisplayStatus,
  getBloodDonationPlanDisplayStatus,
  getCountdownLabel,
  getCurrentBloodDonationPlan,
  getNextBloodDonationMissionSummary
} from '@/lib/blood-donation/plan-display';
import { BloodDonationDashboardViewModel, BloodDonationEventViewModel } from '@/lib/blood-donation/types';

type Props = {
  initialData: BloodDonationDashboardViewModel;
};

type ModalState = 'goal' | 'planned' | 'completed' | 'convert' | 'reschedule' | null;

const dateFormatter = new Intl.DateTimeFormat('th-TH', { day: 'numeric', month: 'long', year: 'numeric' });

const formatDate = (value: string | null) => (value ? dateFormatter.format(new Date(`${value}T00:00:00`)) : '-');

const displayStatusMeta: Record<BloodDonationPlanDisplayStatus, { label: string; className: string }> = {
  CURRENT: { label: 'แผนปัจจุบัน', className: 'bg-rose-500/20 text-rose-100 border border-rose-300/40' },
  TODAY: { label: 'วันนี้', className: 'bg-orange-500/20 text-orange-100 border border-orange-300/40' },
  SOON: { label: 'ใกล้ถึงกำหนด', className: 'bg-sky-500/20 text-sky-100 border border-sky-300/40' },
  UPCOMING: { label: 'วางแผนไว้แล้ว', className: 'bg-blue-500/20 text-blue-100 border border-blue-300/40' },
  OVERDUE: { label: 'เลยกำหนด', className: 'bg-amber-500/20 text-amber-100 border border-amber-300/40' },
  COMPLETED: { label: 'ทำแล้ว', className: 'bg-emerald-500/20 text-emerald-100 border border-emerald-300/40' },
  CANCELLED: { label: 'ยกเลิกแล้ว', className: 'bg-slate-500/30 text-slate-200 border border-slate-300/30' }
};

const getPlanCardTone = (status: BloodDonationPlanDisplayStatus, isCurrent: boolean) => {
  if (isCurrent || status === 'CURRENT') {
    return 'border-rose-300/60 bg-gradient-to-br from-rose-500/15 via-slate-900/80 to-purple-500/10 shadow-lg shadow-rose-900/30';
  }

  if (status === 'OVERDUE') return 'border-amber-400/40 bg-amber-500/5';
  if (status === 'TODAY') return 'border-orange-400/40 bg-orange-500/5';
  if (status === 'CANCELLED') return 'border-slate-500/40 bg-slate-900/50 opacity-80';
  if (status === 'COMPLETED') return 'border-emerald-400/40 bg-emerald-500/5';

  return 'border-white/10 bg-slate-950/40';
};

export function BloodDonationDashboard({ initialData }: Props) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState>(null);
  const [selectedEvent, setSelectedEvent] = useState<BloodDonationEventViewModel | null>(null);

  const canManageEvents = Boolean(data.goal);

  const now = new Date();
  const currentPlan = useMemo(() => getCurrentBloodDonationPlan(data.upcomingPlans), [data.upcomingPlans]);

  const refreshDashboard = async () => {
    const response = await fetch('/api/blood-donation', { cache: 'no-store' });
    const json = await response.json();

    if (!response.ok) {
      throw new Error(json.error ?? 'โหลดข้อมูลไม่สำเร็จ');
    }

    setData(json);
  };

  const submit = async (handler: () => Promise<void>) => {
    try {
      setLoading(true);
      setError(null);
      await handler();
      await refreshDashboard();
      setModal(null);
      setSelectedEvent(null);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'บันทึกข้อมูลไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  const summary = data.summary;
  const chance = data.chance;

  const completedRatioLabel = useMemo(() => {
    if (!summary) return '0/0';
    return `${summary.completedCount}/${summary.targetCount}`;
  }, [summary]);

  const nextPlanSummaryLabel = currentPlan ? formatDate(currentPlan.planned_date) : null;

  return (
    <section className="space-y-6">
      <article className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-black/30">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-3xl font-semibold text-white">Blood Donation</h2>
            <p className="mt-2 text-slate-300">ติดตามแผนบริจาค วันที่ไปจริง และโอกาสไปถึงเป้าหมาย</p>
            {data.goal ? (
              <p className="mt-2 text-sm text-slate-400">
                ช่วงเป้าหมาย: {formatDate(data.goal.start_date)} - {formatDate(data.goal.end_date)}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2">
            <button onClick={() => setModal('goal')} className="rounded-full bg-rose-500/20 px-4 py-2 text-sm font-medium text-rose-200">
              {data.goal ? 'สร้าง Goal ใหม่' : 'สร้าง Goal แรก'}
            </button>
            <button
              onClick={() => setModal('planned')}
              disabled={!canManageEvents}
              className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              + วางแผนบริจาค
            </button>
            <button
              onClick={() => setModal('completed')}
              disabled={!canManageEvents}
              className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              + บันทึกว่าบริจาคแล้ว
            </button>
          </div>
        </div>

        {!data.goal ? (
          <div className="mt-6 rounded-2xl border border-dashed border-white/20 bg-slate-950/40 p-6 text-center text-slate-200">
            <p className="text-lg font-medium">ยังไม่มีเป้าหมายการบริจาคเลือด</p>
            <p className="mt-2 text-sm text-slate-400">เริ่มต้นด้วยการตั้งเป้าหมาย 3 ครั้งในปีนี้</p>
          </div>
        ) : null}
      </article>

      {summary && chance ? (
        <>
          <BloodDonationNextMissionCard
            currentPlan={currentPlan}
            now={now}
            onMarkDone={(event) => {
              setSelectedEvent(event);
              setModal('convert');
            }}
            onReschedule={(event) => {
              setSelectedEvent(event);
              setModal('reschedule');
            }}
            onCancel={(event) =>
              submit(async () => {
                await fetch(`/api/blood-donation/events/${event.id}/cancel`, { method: 'PATCH' });
              })
            }
          />

          <section className="grid gap-4 md:grid-cols-4">
            {[
              ['เป้าหมาย', `${summary.targetCount} ครั้ง`],
              ['ทำสำเร็จแล้ว', `${summary.completedCount} ครั้ง`],
              ['วางแผนไว้แล้ว', `${summary.plannedCount} ครั้ง`],
              ['เหลืออีก', `${summary.remainingToTarget} ครั้ง`]
            ].map(([label, value]) => (
              <article key={label} className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</p>
                <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
                {label === 'เหลืออีก' && nextPlanSummaryLabel ? <p className="mt-1 text-xs text-slate-400">แผนถัดไป: {nextPlanSummaryLabel}</p> : null}
              </article>
            ))}
          </section>

          <section className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
            <article className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
              <p className="text-sm text-slate-300">Progress</p>
              <p className="mt-2 text-2xl font-semibold text-white">{completedRatioLabel}</p>
              <div className="mt-4 h-3 rounded-full bg-slate-800">
                <div className="h-3 rounded-full bg-gradient-to-r from-rose-400 to-orange-300" style={{ width: `${summary.progressPercent}%` }} />
              </div>
            </article>

            <article className="rounded-2xl border border-rose-300/20 bg-gradient-to-br from-rose-500/10 to-purple-500/10 p-5">
              <p className="text-sm text-slate-300">Chance to Reach Goal</p>
              <p className="mt-2 text-4xl font-semibold text-white">{chance.score}%</p>
              <p className="mt-1 inline-flex rounded-full bg-white/10 px-3 py-1 text-sm text-slate-100">{chance.label}</p>
              <p className="mt-3 text-sm text-slate-200">{chance.shortMessage}</p>
              <p className="mt-1 text-xs text-slate-400">{chance.coachingMessage}</p>
            </article>
          </section>
        </>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
          <h3 className="text-xl font-semibold text-white">Upcoming Plans</h3>
          {!data.upcomingPlans.length ? (
            <p className="mt-4 text-sm text-slate-400">ยังไม่มีแผนการบริจาค ลองเพิ่มวันแรกของคุณ</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {data.upcomingPlans.map((event) => (
                <BloodDonationPlanCard
                  key={event.id}
                  event={event}
                  now={now}
                  currentPlan={currentPlan}
                  onMarkDone={() => {
                    setSelectedEvent(event);
                    setModal('convert');
                  }}
                  onReschedule={() => {
                    setSelectedEvent(event);
                    setModal('reschedule');
                  }}
                  onCancel={() =>
                    submit(async () => {
                      await fetch(`/api/blood-donation/events/${event.id}/cancel`, { method: 'PATCH' });
                    })
                  }
                />
              ))}
            </ul>
          )}
        </article>

        <article className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
          <h3 className="text-xl font-semibold text-white">Donation History</h3>
          {!data.history.length ? (
            <p className="mt-4 text-sm text-slate-400">ยังไม่มีประวัติ completed</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {data.history.map((event) => (
                <li key={event.id} className="rounded-xl border border-white/10 bg-slate-950/40 p-4">
                  <p className="text-lg font-semibold text-white">{formatDate(event.actual_date)}</p>
                  {event.planned_date ? <p className="text-xs text-slate-500">จากแผน: {formatDate(event.planned_date)}</p> : null}
                  <p className="mt-1 text-xs text-slate-400">{event.location || 'ไม่ระบุสถานที่'}</p>
                  {event.note ? <p className="mt-1 text-sm text-slate-300">{event.note}</p> : null}
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>

      {error ? <p className="rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</p> : null}

      <ModalShell open={modal !== null} onClose={() => setModal(null)}>
        {modal === 'goal' ? (
          <GoalForm
            loading={loading}
            onSubmit={(event) =>
              submit(async () => {
                event.preventDefault();
                const formData = new FormData(event.currentTarget);
                await fetch('/api/blood-donation/goals', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(Object.fromEntries(formData.entries()))
                });
              })
            }
          />
        ) : null}

        {modal === 'planned' && data.goal ? (
          <PlannedForm
            loading={loading}
            onSubmit={(event) =>
              submit(async () => {
                event.preventDefault();
                const formData = new FormData(event.currentTarget);
                await fetch(`/api/blood-donation/goals/${data.goal?.id}/events`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ ...Object.fromEntries(formData.entries()), mode: 'planned' })
                });
              })
            }
          />
        ) : null}

        {modal === 'completed' && data.goal ? (
          <CompletedForm
            loading={loading}
            onSubmit={(event) =>
              submit(async () => {
                event.preventDefault();
                const formData = new FormData(event.currentTarget);
                await fetch(`/api/blood-donation/goals/${data.goal?.id}/events`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ ...Object.fromEntries(formData.entries()), mode: 'completed' })
                });
              })
            }
          />
        ) : null}

        {modal === 'convert' && selectedEvent ? (
          <ConvertForm
            loading={loading}
            onSubmit={(event) =>
              submit(async () => {
                event.preventDefault();
                const formData = new FormData(event.currentTarget);
                await fetch(`/api/blood-donation/events/${selectedEvent.id}/complete`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(Object.fromEntries(formData.entries()))
                });
              })
            }
          />
        ) : null}

        {modal === 'reschedule' && selectedEvent ? (
          <RescheduleForm
            defaultDate={selectedEvent.planned_date ?? ''}
            defaultLocation={selectedEvent.location ?? ''}
            defaultNote={selectedEvent.note ?? ''}
            loading={loading}
            onSubmit={(event) =>
              submit(async () => {
                event.preventDefault();
                const formData = new FormData(event.currentTarget);
                await fetch(`/api/blood-donation/events/${selectedEvent.id}/reschedule`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(Object.fromEntries(formData.entries()))
                });
              })
            }
          />
        ) : null}
      </ModalShell>
    </section>
  );
}

function BloodDonationNextMissionCard({
  currentPlan,
  now,
  onMarkDone,
  onReschedule,
  onCancel
}: {
  currentPlan: BloodDonationEventViewModel | null;
  now: Date;
  onMarkDone: (event: BloodDonationEventViewModel) => void;
  onReschedule: (event: BloodDonationEventViewModel) => void;
  onCancel: (event: BloodDonationEventViewModel) => void;
}) {
  const missionSummary = getNextBloodDonationMissionSummary(currentPlan);

  return (
    <article className="rounded-3xl border border-rose-300/30 bg-gradient-to-br from-rose-500/15 via-slate-900/90 to-purple-500/10 p-6 shadow-2xl shadow-rose-900/20">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rose-200">Next Mission</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">ภารกิจถัดไป</h3>
          <p className="mt-1 text-sm text-slate-300">{missionSummary.primaryText}</p>
        </div>
      </div>

      {!currentPlan ? (
        <div className="mt-5 rounded-2xl border border-dashed border-white/20 bg-slate-950/30 p-5">
          <p className="text-lg font-medium text-white">ยังไม่มีแผนถัดไป</p>
          <p className="mt-1 text-sm text-slate-400">ครบทุกแผนแล้ว หรือยังไม่ได้สร้างแผนใหม่</p>
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm text-slate-300">บริจาคเลือดครั้งถัดไป</p>
              <p className="mt-1 text-3xl font-semibold text-white">{formatDate(currentPlan.planned_date)}</p>
              <p className="mt-1 text-sm text-slate-300">{missionSummary.secondaryText || 'ไม่ระบุสถานที่'}</p>
              {currentPlan.note ? <p className="mt-2 text-sm text-slate-400">{currentPlan.note}</p> : null}
            </div>

            <div className="space-y-2 text-right">
              <span className="inline-flex rounded-full px-3 py-1 text-xs font-medium bg-rose-500/20 text-rose-100 border border-rose-300/40">แผนปัจจุบัน</span>
              <p className="text-2xl font-semibold text-rose-100">{getCountdownLabel(currentPlan.planned_date, now)}</p>
              <p className="text-xs text-slate-300">{displayStatusMeta[getBloodDonationPlanDisplayStatus(currentPlan, currentPlan, now)].label}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <button className="rounded-full bg-emerald-500/20 px-3 py-1 text-emerald-100" onClick={() => onMarkDone(currentPlan)}>
              ทำจริงแล้ว
            </button>
            <button className="rounded-full bg-blue-500/20 px-3 py-1 text-blue-100" onClick={() => onReschedule(currentPlan)}>
              เลื่อนแผน
            </button>
            <button className="rounded-full bg-slate-500/30 px-3 py-1 text-slate-200" onClick={() => onCancel(currentPlan)}>
              ยกเลิก
            </button>
          </div>
        </div>
      )}
    </article>
  );
}

function BloodDonationPlanCard({
  event,
  currentPlan,
  now,
  onMarkDone,
  onReschedule,
  onCancel
}: {
  event: BloodDonationEventViewModel;
  currentPlan: BloodDonationEventViewModel | null;
  now: Date;
  onMarkDone: () => void;
  onReschedule: () => void;
  onCancel: () => void;
}) {
  const status = getBloodDonationPlanDisplayStatus(event, currentPlan, now);
  const statusMeta = displayStatusMeta[status];
  const isCurrent = event.id === currentPlan?.id;

  return (
    <li className={`rounded-xl border p-4 ${getPlanCardTone(status, isCurrent)}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-lg font-semibold text-white">{formatDate(event.planned_date)}</p>
          <p className="text-sm font-medium text-rose-100">{getCountdownLabel(event.planned_date, now)}</p>
          <p className="text-xs text-slate-400">{event.location || 'ไม่ระบุสถานที่'}</p>
          {event.note ? <p className="mt-1 text-sm text-slate-300">{event.note}</p> : null}
        </div>

        <div className="flex flex-col items-end gap-1">
          <span className={`rounded-full px-3 py-1 text-xs ${statusMeta.className}`}>{statusMeta.label}</span>
          {isCurrent ? <span className="text-[11px] text-rose-200">โฟกัสตอนนี้</span> : null}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        <button className="rounded-full bg-emerald-500/20 px-3 py-1 text-emerald-200" onClick={onMarkDone}>
          ทำจริงแล้ว
        </button>
        <button className="rounded-full bg-blue-500/20 px-3 py-1 text-blue-100" onClick={onReschedule}>
          เลื่อนแผน
        </button>
        <button className="rounded-full bg-slate-500/30 px-3 py-1 text-slate-200" onClick={onCancel}>
          ยกเลิก
        </button>
      </div>
    </li>
  );
}

function ModalShell({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-slate-900 p-5">
        <div className="mb-4 flex justify-end">
          <button onClick={onClose} className="rounded-full bg-white/10 px-3 py-1 text-xs text-white">
            ปิด
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Input({ name, label, type = 'text', defaultValue, required = false }: { name: string; label: string; type?: string; defaultValue?: string; required?: boolean }) {

  return (
    <label className="space-y-1 text-sm text-slate-200">
      <span>{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        className="w-full rounded-xl border border-white/15 bg-slate-950/60 px-3 py-2 text-white outline-none"
      />
    </label>
  );
}

function GoalForm({ loading, onSubmit }: { loading: boolean; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {

  return (
    <form className="space-y-3" onSubmit={onSubmit}>
      <h4 className="text-xl font-semibold text-white">Create Goal</h4>
      <Input name="title" label="Title" required />
      <Input name="target_count" label="Target Count" type="number" defaultValue="3" required />
      <Input name="start_date" label="Start Date" type="date" required />
      <Input name="end_date" label="End Date" type="date" required />
      <button disabled={loading} className="rounded-full bg-rose-500/20 px-4 py-2 text-sm text-rose-100 disabled:opacity-60">
        {loading ? 'Saving...' : 'Save Goal'}
      </button>
    </form>
  );
}

function PlannedForm({ loading, onSubmit }: { loading: boolean; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {

  return (
    <form className="space-y-3" onSubmit={onSubmit}>
      <h4 className="text-xl font-semibold text-white">Add Planned Donation</h4>
      <Input name="planned_date" label="Planned Date" type="date" required />
      <Input name="location" label="Location" />
      <Input name="note" label="Note" />
      <button disabled={loading} className="rounded-full bg-rose-500/20 px-4 py-2 text-sm text-rose-100 disabled:opacity-60">
        {loading ? 'Saving...' : 'Save Plan'}
      </button>
    </form>
  );
}

function CompletedForm({ loading, onSubmit }: { loading: boolean; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {

  return (
    <form className="space-y-3" onSubmit={onSubmit}>
      <h4 className="text-xl font-semibold text-white">Add Completed Donation</h4>
      <Input name="actual_date" label="Actual Date" type="date" required />
      <Input name="location" label="Location" />
      <Input name="note" label="Note" />
      <button disabled={loading} className="rounded-full bg-rose-500/20 px-4 py-2 text-sm text-rose-100 disabled:opacity-60">
        {loading ? 'Saving...' : 'Save Completed'}
      </button>
    </form>
  );
}

function ConvertForm({ loading, onSubmit }: { loading: boolean; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {

  return (
    <form className="space-y-3" onSubmit={onSubmit}>
      <h4 className="text-xl font-semibold text-white">Convert Planned to Completed</h4>
      <Input name="actual_date" label="Actual Date" type="date" required />
      <Input name="note" label="Note" />
      <button disabled={loading} className="rounded-full bg-emerald-500/20 px-4 py-2 text-sm text-emerald-100 disabled:opacity-60">
        {loading ? 'Saving...' : 'Mark Completed'}
      </button>
    </form>
  );
}

function RescheduleForm({
  defaultDate,
  defaultLocation,
  defaultNote,
  loading,
  onSubmit
}: {
  defaultDate: string;
  defaultLocation: string;
  defaultNote: string;
  loading: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {

  return (
    <form className="space-y-3" onSubmit={onSubmit}>
      <h4 className="text-xl font-semibold text-white">Reschedule Planned Event</h4>
      <Input name="planned_date" label="Planned Date" type="date" defaultValue={defaultDate} required />
      <Input name="location" label="Location" defaultValue={defaultLocation} />
      <Input name="note" label="Note" defaultValue={defaultNote} />
      <button disabled={loading} className="rounded-full bg-blue-500/20 px-4 py-2 text-sm text-blue-100 disabled:opacity-60">
        {loading ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  );
}
