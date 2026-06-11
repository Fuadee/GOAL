'use client';

import { FormEvent, ReactNode, useMemo, useState } from 'react';

import { RewardFormModal } from '@/components/rewards/RewardFormModal';
import { RewardPreviewCard } from '@/components/heal-the-world/RewardPreviewCard';
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

type ModalState = 'goal' | 'planned' | 'completed' | 'convert' | 'reschedule' | 'reward' | 'deleteReward' | null;

const dateFormatter = new Intl.DateTimeFormat('th-TH', { day: 'numeric', month: 'long', year: 'numeric' });

const formatDate = (value: string | null) => (value ? dateFormatter.format(new Date(`${value}T00:00:00`)) : '-');

const displayStatusMeta: Record<BloodDonationPlanDisplayStatus, { label: string; className: string }> = {
  CURRENT: { label: 'แผนปัจจุบัน', className: 'bg-cyan-400/12 text-cyan-100 border border-cyan-300/25' },
  TODAY: { label: 'วันนี้', className: 'bg-cyan-400/10 text-cyan-100 border border-cyan-300/20' },
  SOON: { label: 'ใกล้ถึงกำหนด', className: 'bg-cyan-400/10 text-cyan-100 border border-cyan-300/20' },
  UPCOMING: { label: 'วางแผนไว้แล้ว', className: 'bg-slate-800/80 text-slate-200 border border-white/10' },
  OVERDUE: { label: 'เลยกำหนด', className: 'bg-red-500/12 text-red-100 border border-red-300/20' },
  COMPLETED: { label: 'ทำแล้ว', className: 'bg-emerald-500/20 text-emerald-100 border border-emerald-300/40' },
  CANCELLED: { label: 'ยกเลิกแล้ว', className: 'bg-slate-500/30 text-slate-200 border border-slate-300/30' }
};


const isDev = process.env.NODE_ENV === 'development';

async function apiRequest(input: RequestInfo | URL, init?: RequestInit) {
  const response = await fetch(input, init);
  let json: unknown = null;
  try {
    json = await response.json();
  } catch {
    json = null;
  }

  if (isDev) {
    console.log('[blood-donation] API response', { input: String(input), status: response.status, ok: response.ok, json });
  }

  if (!response.ok) {
    const errorMessage =
      typeof json === 'object' && json !== null && 'error' in json && typeof (json as { error?: unknown }).error === 'string'
        ? (json as { error: string }).error
        : 'บันทึกข้อมูลไม่สำเร็จ';
    throw new Error(errorMessage);
  }

  return json;
}

const getPlanCardTone = (status: BloodDonationPlanDisplayStatus, isCurrent: boolean) => {
  if (isCurrent || status === 'CURRENT') {
    return 'border-cyan-400/20 bg-gradient-to-br from-[#0b1724] via-[#0b1522] to-[#111b2c] shadow-[0_10px_30px_-24px_rgba(45,212,191,0.35)]';
  }

  if (status === 'OVERDUE') return 'border-red-300/20 bg-red-500/5';
  if (status === 'TODAY') return 'border-cyan-400/20 bg-cyan-500/5';
  if (status === 'CANCELLED') return 'border-slate-500/40 bg-slate-900/50 opacity-80';
  if (status === 'COMPLETED') return 'border-cyan-400/20 bg-cyan-500/5';

  return 'border-white/10 bg-slate-950/40';
};

export function BloodDonationDashboard({ initialData }: Props) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState>(null);
  const [selectedEvent, setSelectedEvent] = useState<BloodDonationEventViewModel | null>(null);

  const canManageEvents = Boolean(data.goal);

  const now = new Date();
  const currentPlan = useMemo(() => getCurrentBloodDonationPlan(data.upcomingPlans), [data.upcomingPlans]);
  const isCurrentMissionCompleted = currentPlan?.status === 'completed';

  const refreshDashboard = async () => {
    const json = (await apiRequest('/api/blood-donation', { cache: 'no-store' })) as BloodDonationDashboardViewModel;
    if (isDev) {
      console.log('[blood-donation] updated mission reward', json.currentMission?.reward);
    }
    setData(json);
  };

  const submit = async (handler: () => Promise<void>) => {
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);
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
  const completedRatioLabel = useMemo(() => {
    if (!summary) return '0 / 0';
    return `${summary.completedCount} / ${summary.targetCount}`;
  }, [summary]);

  return (
    <section className="space-y-3.5">


      {summary ? (
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
                await apiRequest(`/api/blood-donation/events/${event.id}/cancel`, { method: 'PATCH' });
              })
            }
          />
          <RewardPreviewCard
            missionTitle={data.currentMission?.title}
            reward={data.currentMission?.reward}
            isMissionCompleted={isCurrentMissionCompleted}
            onAddReward={() => setModal('reward')}
            onDeleteReward={() => setModal('deleteReward')}
            isClaimingReward={loading}
            onClaimReward={() =>
              submit(async () => {
                if (!currentPlan) return;
                await apiRequest(`/api/blood-donation/events/${currentPlan.id}/claim-reward`, { method: 'PATCH' });
                setSuccessMessage('รับรางวัลสำเร็จ! ภารกิจนี้ถูกบันทึกว่า claimed แล้ว');
              })
            }
          />

          <section className="pt-0.5">
            <article className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#0a1422]/95 via-[#0f1b2c]/95 to-[#121c2f]/95 p-5 shadow-[0_20px_44px_-38px_rgba(15,23,42,0.75)] transition duration-500 hover:border-cyan-300/20 hover:shadow-[0_24px_48px_-40px_rgba(45,212,191,0.25)] md:p-6">
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-28 right-[-5rem] h-72 w-72 rounded-full bg-cyan-300/6 blur-3xl transition duration-500 group-hover:bg-cyan-300/10" />
                <div className="absolute -bottom-28 left-[-4rem] h-64 w-64 rounded-full bg-slate-500/10 blur-3xl" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(255,255,255,0.13),transparent_52%)]" />
              </div>
              <div className="pointer-events-none absolute inset-[1px] rounded-[calc(1.5rem-1px)] border border-white/10" />

              <div className="relative">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold tracking-[0.01em] text-[color:var(--text-secondary)]">ความคืบหน้าภารกิจ</p>
                    <h3 className="mt-1 text-2xl font-medium tracking-tight text-white sm:text-[1.7rem]">บริจาคเลือดปีนี้</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium tracking-[0.01em] text-[color:var(--text-primary)]">{completedRatioLabel} เสร็จแล้ว</p>
                    <p className="mt-1 text-xs text-[color:var(--text-muted)]">{summary.progressPercent}% สำเร็จ</p>
                  </div>
                </div>

                <div className="relative mt-4">
                  <div className="h-5 rounded-full bg-white/10 p-[2px] shadow-[inset_0_1px_0_rgba(255,255,255,0.14),inset_0_-8px_16px_rgba(15,23,42,0.65)]">
                    <div
                      className="relative h-full rounded-full bg-gradient-to-r from-cyan-500 to-cyan-400 transition-all duration-1000 ease-out"
                      style={{ width: `${summary.progressPercent}%` }}
                    >
                      {summary.progressPercent > 0 ? (
                        <div className="absolute inset-0 rounded-full bg-[linear-gradient(to_bottom,rgba(255,255,255,0.38),transparent_65%)] shadow-[0_0_10px_rgba(45,212,191,0.45)]" />
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2.5">
                  {Array.from({ length: 3 }, (_, index) => {
                    const isCompleted = index < summary.completedCount;
                    return (
                      <span
                        key={index}
                        className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition ${
                          isCompleted
                            ? 'border-cyan-300/25 bg-cyan-400/10 text-cyan-100'
                            : 'border-slate-300/20 bg-slate-800/55 text-slate-300'
                        }`}
                      >
                        {isCompleted ? '✓' : '○'} ครั้งที่ {index + 1}
                      </span>
                    );
                  })}
                </div>
              </div>
            </article>
          </section>
        </>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-white/10 bg-[#121c2b]/88 p-5 shadow-[0_16px_36px_-32px_rgba(2,6,23,0.9)] transition duration-300 hover:border-cyan-300/15">
          <h3 className="text-xl font-medium text-white">Upcoming Plans</h3>
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
                      await apiRequest(`/api/blood-donation/events/${event.id}/cancel`, { method: 'PATCH' });
                    })
                  }
                />
              ))}
            </ul>
          )}
        </article>

        <article className="rounded-2xl border border-white/15 bg-slate-900/65 p-5 shadow-[0_20px_50px_-40px_rgba(15,23,42,1)] transition duration-300 hover:-translate-y-0.5 hover:border-cyan-200/30 hover:border-cyan-300/15">
          <h3 className="text-xl font-medium text-white">Donation History</h3>
          {!data.history.length ? (
            <p className="mt-4 text-sm text-slate-400">ยังไม่มีประวัติ completed</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {data.history.map((event) => (
                <li key={event.id} className="rounded-xl border border-white/10 bg-slate-950/45 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition hover:border-white/20">
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

      <section className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold text-white">จัดการแผนบริจาค</h3>
            <p className="mt-1 text-sm text-slate-300">สร้าง Goal ใหม่ วางแผนบริจาค และบันทึกว่าบริจาคแล้ว</p>
            {data.goal ? (
              <p className="mt-2 text-xs text-slate-400">
                ช่วงเป้าหมาย: {formatDate(data.goal.start_date)} - {formatDate(data.goal.end_date)}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2">
            <button onClick={() => setModal('goal')} className="rounded-full border border-cyan-400/25 bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950">
              {data.goal ? 'สร้าง Goal ใหม่' : 'สร้าง Goal แรก'}
            </button>
            <button
              onClick={() => setModal('planned')}
              disabled={!canManageEvents}
              className="rounded-full border border-white/10 bg-slate-800/85 px-4 py-2 text-sm font-medium text-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              + วางแผนบริจาค
            </button>
            <button
              onClick={() => setModal('completed')}
              disabled={!canManageEvents}
              className="rounded-full border border-white/10 bg-slate-800/85 px-4 py-2 text-sm font-medium text-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              + บันทึกว่าบริจาคแล้ว
            </button>
          </div>
        </div>

        {!data.goal ? (
          <div className="mt-4 rounded-2xl border border-dashed border-white/20 bg-slate-950/40 p-5 text-center text-slate-200">
            <p className="text-lg font-medium">ยังไม่มีเป้าหมายการบริจาคเลือด</p>
            <p className="mt-2 text-sm text-slate-400">เริ่มต้นด้วยการตั้งเป้าหมาย 3 ครั้งในปีนี้</p>
          </div>
        ) : null}
      </section>

      {successMessage ? <p className="rounded-xl border border-emerald-400/35 bg-emerald-500/10 p-3 text-sm text-emerald-100">{successMessage}</p> : null}
      {error ? <p className="rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</p> : null}

      <ModalShell open={modal !== null} onClose={() => setModal(null)}>
        {modal === 'goal' ? (
          <GoalForm
            loading={loading}
            onSubmit={(event) =>
              submit(async () => {
                event.preventDefault();
                const formData = new FormData(event.currentTarget);
                await apiRequest('/api/blood-donation/goals', {
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
                await apiRequest(`/api/blood-donation/goals/${data.goal?.id}/events`, {
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
                await apiRequest(`/api/blood-donation/goals/${data.goal?.id}/events`, {
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
                await apiRequest(`/api/blood-donation/events/${selectedEvent.id}/complete`, {
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
                await apiRequest(`/api/blood-donation/events/${selectedEvent.id}/reschedule`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(Object.fromEntries(formData.entries()))
                });
              })
            }
          />
        ) : null}


        {modal === 'deleteReward' && currentPlan ? (
          <DeleteRewardConfirm
            loading={loading}
            onCancel={() => setModal(null)}
            onConfirm={() =>
              submit(async () => {
                const payload = {
                  planned_date: currentPlan.planned_date,
                  location: currentPlan.location ?? '',
                  note: currentPlan.note ?? '',
                  reward_title: null,
                  reward_thai_title: null,
                  reward_description: null,
                  reward_emotional_copy: null,
                  reward_image_url: null,
                  reward_status: null
                };
                await apiRequest(`/api/blood-donation/events/${currentPlan.id}/reschedule`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(payload)
                });
                setSuccessMessage('ลบ reward ออกจากภารกิจเรียบร้อยแล้ว');
              })
            }
          />
        ) : null}
        {modal === 'reward' && currentPlan ? (
          <RewardFormModal
            open
            levelId={currentPlan.id}
            defaultValues={{
              title: currentPlan.reward_title,
              imageUrl: currentPlan.reward_image_url
            }}
            onClose={() => setModal(null)}
            onSubmit={(fd) =>
              submit(async () => {
                const payload = {
                  planned_date: currentPlan.planned_date,
                  location: currentPlan.location ?? '',
                  note: currentPlan.note ?? '',
                  reward_title: String(fd.get('title') ?? ''),
                  reward_image_url: String(fd.get('image_url') ?? ''),
                  reward_status: String(currentPlan.reward_status ?? 'locked')
                };
                await apiRequest(`/api/blood-donation/events/${currentPlan.id}/reschedule`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(payload)
                });
              })
            }
          />
        ) : null}
      </ModalShell>
    </section>
  );
}


function DeleteRewardConfirm({ loading, onCancel, onConfirm }: { loading: boolean; onCancel: () => void; onConfirm: () => void }) {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-lg font-semibold text-white">ลบรางวัลนี้ออกจากภารกิจ?</h4>
        <p className="mt-1 text-sm text-slate-300">คุณสามารถเพิ่ม reward ใหม่ภายหลังได้</p>
      </div>
      <div className="flex flex-wrap justify-end gap-2.5">
        <button
          type="button"
          onClick={onCancel}
          className="min-h-10 rounded-xl border border-white/15 bg-slate-800/85 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-slate-700/85"
        >
          ยกเลิก
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={onConfirm}
          className="min-h-10 rounded-xl border border-rose-300/30 bg-rose-500/12 px-4 py-2 text-sm font-medium text-rose-100 transition hover:bg-rose-500/22 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? 'กำลังลบ...' : 'ลบ reward'}
        </button>
      </div>
    </div>
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
    <article className="relative overflow-hidden rounded-[1.75rem] border border-cyan-400/15 bg-gradient-to-br from-[#081321] via-[#0d1828] to-[#121f31] p-4 shadow-[0_14px_36px_-30px_rgba(45,212,191,0.35)] sm:p-5">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 right-[-4rem] h-56 w-56 rounded-full bg-cyan-300/8 blur-3xl" />
        <div className="absolute -bottom-24 left-[-3rem] h-52 w-52 rounded-full bg-slate-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_12%,rgba(255,255,255,0.11),transparent_52%)]" />
      </div>
      <div className="pointer-events-none absolute inset-[1px] rounded-[calc(1.75rem-1px)] border border-white/10" />
      <div className="pointer-events-none absolute inset-0 rounded-[1.75rem] shadow-[inset_0_1px_0_rgba(255,255,255,0.16),inset_0_-28px_56px_rgba(2,6,23,0.62)]" />

      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-100/80">Next Mission</p>
            <h3 className="mt-1.5 text-[1.6rem] font-semibold tracking-tight text-white sm:text-[1.72rem]">ภารกิจถัดไป</h3>
            <p className="mt-1.5 text-[13px] leading-relaxed text-slate-200/85">{missionSummary.primaryText}</p>
          </div>
        </div>

        {!currentPlan ? (
          <div className="mt-4 rounded-xl border border-dashed border-white/20 bg-slate-950/35 p-4">
            <p className="text-lg font-medium text-white">ยังไม่มีแผนถัดไป</p>
            <p className="mt-1 text-sm text-slate-300">ครบทุกแผนแล้ว หรือยังไม่ได้สร้างแผนใหม่</p>
          </div>
        ) : (
          <div className="mt-4 space-y-3.5">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-cyan-100/70">Remaining</p>
                <p className="mt-0.5 text-[2rem] font-semibold leading-none tracking-tight text-cyan-100 sm:text-[2.2rem]">{getCountdownLabel(currentPlan.planned_date, now)}</p>
              </div>
              <p className="pb-1 text-right text-base font-semibold leading-tight text-white sm:text-lg">{formatDate(currentPlan.planned_date)}</p>
            </div>

            <div className="h-px w-full bg-gradient-to-r from-white/45 via-white/20 to-transparent" />

            <p className="text-sm text-slate-100/95">{missionSummary.secondaryText || 'ไม่ระบุสถานที่'}</p>
            {currentPlan.note ? <p className="text-xs leading-relaxed text-slate-300">{currentPlan.note}</p> : null}

            <div className="pt-0.5">
              <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-medium ${displayStatusMeta[getBloodDonationPlanDisplayStatus(currentPlan, currentPlan, now)].className}`}>
                {displayStatusMeta[getBloodDonationPlanDisplayStatus(currentPlan, currentPlan, now)].label}
              </span>
            </div>

            <div className="space-y-2 pt-1 text-sm">
              <button
                className="w-full rounded-xl border border-cyan-400/25 bg-cyan-500 px-4 py-2.5 font-medium text-slate-950 shadow-[0_8px_18px_-14px_rgba(45,212,191,0.5)] transition hover:brightness-105 active:translate-y-px"
                onClick={() => onMarkDone(currentPlan)}
              >
                ทำจริงแล้ว
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  className="rounded-lg border border-white/10 bg-slate-800/80 px-3 py-2 text-[13px] font-medium text-slate-200 transition hover:bg-slate-700/80 active:translate-y-px"
                  onClick={() => onReschedule(currentPlan)}
                >
                  เลื่อนแผน
                </button>
                <button
                  className="rounded-lg border border-slate-200/20 bg-slate-300/10 px-3 py-2 text-[13px] font-medium text-slate-100 transition hover:bg-slate-300/20 active:translate-y-px"
                  onClick={() => onCancel(currentPlan)}
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
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
          <p className="text-sm font-medium text-cyan-100/85">{getCountdownLabel(event.planned_date, now)}</p>
          <p className="text-xs text-slate-400">{event.location || 'ไม่ระบุสถานที่'}</p>
          {event.note ? <p className="mt-1 text-sm text-slate-300">{event.note}</p> : null}
        </div>

        <div className="flex flex-col items-end gap-1">
          <span className={`rounded-full px-3 py-1 text-xs ${statusMeta.className}`}>{statusMeta.label}</span>
          {isCurrent ? <span className="text-[11px] text-cyan-200/80">โฟกัสตอนนี้</span> : null}
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
