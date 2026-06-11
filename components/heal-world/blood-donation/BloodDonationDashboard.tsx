'use client';

import { FormEvent, ReactNode, useMemo, useState } from 'react';

import { RewardFormModal } from '@/components/rewards/RewardFormModal';
import { RewardPreviewCard } from '@/components/rewards/RewardPreviewCard';
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

const readableDisplayStatusClass: Record<BloodDonationPlanDisplayStatus, string> = {
  CURRENT: 'bg-cyan-100 border border-cyan-300 !text-[#155E75]',
  TODAY: 'bg-cyan-100 border border-cyan-300 !text-[#155E75]',
  SOON: 'bg-cyan-100 border border-cyan-300 !text-[#155E75]',
  UPCOMING: 'bg-slate-100 border border-slate-300 !text-[#334155]',
  OVERDUE: 'bg-red-100 border border-red-300 !text-[#B91C1C]',
  COMPLETED: 'bg-emerald-100 border border-emerald-300 !text-[#047857]',
  CANCELLED: 'bg-slate-100 border border-slate-300 !text-[#475569]'
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
            emptyTitle="ภารกิจนี้ยังไม่มีรางวัล"
            emptyDescription="ลองเพิ่มภาพ Moment ที่คุณอยากได้เมื่อทำสำเร็จ"
            lockedCta="ทำภารกิจเพื่อปลดล็อก"
            reward={data.currentMission?.reward}
            isMissionCompleted={isCurrentMissionCompleted}
            onAddReward={() => setModal('reward')}
            onDeleteReward={() => setModal('deleteReward')}
            isClaimingReward={loading}
            improveLockedContrast
            preserveImageAspectRatio
            onClaimReward={() =>
              submit(async () => {
                if (!currentPlan) return;
                await apiRequest(`/api/blood-donation/events/${currentPlan.id}/claim-reward`, { method: 'PATCH' });
                setSuccessMessage('รับรางวัลสำเร็จ! ภารกิจนี้ถูกบันทึกว่า claimed แล้ว');
              })
            }
          />

          <section className="pt-0.5">
            <article className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-[0_20px_45px_-30px_rgba(15,23,42,0.24)] md:p-6">
              <div>
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold tracking-[0.01em] text-slate-500">ความคืบหน้าภารกิจ</p>
                    <h3 className="mt-1 text-2xl font-medium tracking-tight text-slate-950 sm:text-[1.7rem]">บริจาคเลือดปีนี้</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium tracking-[0.01em] text-slate-900">{completedRatioLabel} เสร็จแล้ว</p>
                    <p className="mt-1 text-xs text-slate-500">{summary.progressPercent}% สำเร็จ</p>
                  </div>
                </div>

                <div className="relative mt-4">
                  <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-[color:var(--accent-blue)] transition-all duration-1000 ease-out"
                      style={{ width: `${summary.progressPercent}%` }}
                    />
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
                            ? 'border-blue-200 bg-blue-50 !text-[#1D4ED8]'
                            : 'border-slate-200 bg-slate-100 text-slate-600'
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

        <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_20px_45px_-30px_rgba(15,23,42,0.24)]">
          <h3 className="text-xl font-medium text-slate-950">Donation History</h3>
          {!data.history.length ? (
            <p className="mt-4 text-sm text-slate-500">ยังไม่มีประวัติ completed</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {data.history.map((event) => (
                <li key={event.id} className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 transition hover:bg-white">
                  <p className="text-lg font-semibold text-slate-950">{formatDate(event.actual_date)}</p>
                  {event.planned_date ? <p className="text-xs text-slate-500">จากแผน: {formatDate(event.planned_date)}</p> : null}
                  <p className="mt-1 text-xs text-slate-500">{event.location || 'ไม่ระบุสถานที่'}</p>
                  {event.note ? <p className="mt-1 text-sm text-slate-700">{event.note}</p> : null}
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
            <button onClick={() => setModal('goal')} className="theme-button-primary rounded-full px-4 py-2 text-sm !text-[#FFFFFF]">
              {data.goal ? 'สร้าง Goal ใหม่' : 'สร้าง Goal แรก'}
            </button>
            <button
              onClick={() => setModal('planned')}
              disabled={!canManageEvents}
              className="theme-button-secondary rounded-full px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
            >
              + วางแผนบริจาค
            </button>
            <button
              onClick={() => setModal('completed')}
              disabled={!canManageEvents}
              className="theme-button-secondary rounded-full px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
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
  const displayStatus = currentPlan ? getBloodDonationPlanDisplayStatus(currentPlan, currentPlan, now) : null;
  const lightStatusClass: Record<BloodDonationPlanDisplayStatus, string> = {
    CURRENT: 'border border-cyan-200 bg-cyan-50 text-cyan-800',
    TODAY: 'border border-cyan-200 bg-cyan-50 text-cyan-800',
    SOON: 'border border-cyan-200 bg-cyan-50 text-cyan-800',
    UPCOMING: 'border border-slate-200 bg-slate-100 text-slate-700',
    OVERDUE: 'border border-rose-200 bg-rose-50 text-rose-700',
    COMPLETED: 'border border-emerald-200 bg-emerald-50 text-emerald-700',
    CANCELLED: 'border border-slate-200 bg-slate-100 text-slate-600'
  };

  return (
    <article className="rounded-[24px] border border-slate-200/80 bg-white p-4 shadow-[0_20px_45px_-30px_rgba(15,23,42,0.24)] sm:p-5">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Next Mission</p>
            <h3 className="mt-1.5 text-[1.6rem] font-semibold tracking-tight text-slate-950 sm:text-[1.72rem]">ภารกิจถัดไป</h3>
            <p className="mt-1.5 text-[13px] leading-relaxed text-slate-600">{missionSummary.primaryText}</p>
          </div>
        </div>

        {!currentPlan ? (
          <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/80 p-4">
            <p className="text-lg font-medium text-slate-900">ยังไม่มีแผนถัดไป</p>
            <p className="mt-1 text-sm text-slate-600">ครบทุกแผนแล้ว หรือยังไม่ได้สร้างแผนใหม่</p>
          </div>
        ) : (
          <div className="mt-4 space-y-3.5">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500">Remaining</p>
                <p className="mt-0.5 text-[2rem] font-semibold leading-none tracking-tight text-slate-950 sm:text-[2.2rem]">{getCountdownLabel(currentPlan.planned_date, now)}</p>
              </div>
              <p className="pb-1 text-right text-base font-semibold leading-tight text-slate-900 sm:text-lg">{formatDate(currentPlan.planned_date)}</p>
            </div>

            <div className="h-px w-full bg-slate-200" />

            <p className="text-sm text-slate-700">{missionSummary.secondaryText || 'ไม่ระบุสถานที่'}</p>
            {currentPlan.note ? <p className="text-xs leading-relaxed text-slate-500">{currentPlan.note}</p> : null}

            <div className="pt-0.5">
              <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-medium ${displayStatus ? lightStatusClass[displayStatus] : ''}`}>
                {displayStatus ? displayStatusMeta[displayStatus].label : ''}
              </span>
            </div>

            <div className="space-y-2 pt-1 text-sm">
              <button
                className="w-full rounded-xl border border-blue-600 bg-blue-600 px-4 py-2.5 font-medium !text-[#FFFFFF] shadow-[0_14px_28px_-20px_rgba(37,99,235,0.7)] transition hover:bg-blue-700 active:translate-y-px"
                onClick={() => onMarkDone(currentPlan)}
              >
                ทำจริงแล้ว
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-[13px] font-medium text-slate-700 transition hover:bg-slate-50 active:translate-y-px"
                  onClick={() => onReschedule(currentPlan)}
                >
                  เลื่อนแผน
                </button>
                <button
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-[13px] font-medium text-slate-700 transition hover:bg-slate-50 active:translate-y-px"
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
          <span className={`rounded-full px-3 py-1 text-xs ${readableDisplayStatusClass[status]}`}>{statusMeta.label}</span>
          {isCurrent ? <span className="text-[11px] !text-[#A5F3FC]">โฟกัสตอนนี้</span> : null}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        <button className="rounded-full border border-emerald-300 bg-emerald-100 px-3 py-1 !text-[#047857]" onClick={onMarkDone}>
          ทำจริงแล้ว
        </button>
        <button className="rounded-full border border-blue-300 bg-blue-100 px-3 py-1 !text-[#1D4ED8]" onClick={onReschedule}>
          เลื่อนแผน
        </button>
        <button className="rounded-full border border-slate-300 bg-slate-100 px-3 py-1 !text-[#334155]" onClick={onCancel}>
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
