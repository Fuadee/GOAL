'use client';

import Image from 'next/image';
import { useCallback, useMemo, useState, useTransition } from 'react';

import {
  claimSmvRewardAction,
  createSmvRealDateHistoryAction,
  deleteSmvRewardAction,
  deleteSmvRealDateHistoryAction,
  listSmvRealDateHistoryAction,
  startNewSmvRewardRoundAction,
  upsertSmvRewardAction,
  updateSmvRealDateHistoryAction
} from '@/app/smv/actions';
import { RewardFormModal } from '@/components/rewards/RewardFormModal';
import { SmvMissionRewardRow, SmvRealDateHistoryRow } from '@/lib/smv/types';

type DateFormState = {
  title: string;
  date: string;
  reflection: string;
  tags: string;
};

const EMPTY_FORM: DateFormState = { title: '', date: '', reflection: '', tags: '' };

export function RelationshipMissionDashboard({
  initialDateHistory = [],
  initialReward = null
}: {
  initialDateHistory?: SmvRealDateHistoryRow[];
  initialReward?: SmvMissionRewardRow | null;
}) {
  const [isReflectionOpen, setIsReflectionOpen] = useState(false);
  const [reflection, setReflection] = useState(
    'เริ่มเข้าใจแล้วว่าจริง ๆ ตัวเองต้องการความสัมพันธ์แบบไหน และไม่อยากฝืนตัวเองไปอยู่ในสภาพแวดล้อมที่ไม่ใช่'
  );
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formState, setFormState] = useState<DateFormState>(EMPTY_FORM);
  const [dateHistory, setDateHistory] = useState<SmvRealDateHistoryRow[]>(initialDateHistory);
  const [isRewardModalOpen, setIsRewardModalOpen] = useState(false);
  const [reward, setReward] = useState<SmvMissionRewardRow | null>(initialReward);
  const [rewardError, setRewardError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const loadHistory = useCallback(async () => {
    const rows = await listSmvRealDateHistoryAction();
    setDateHistory(rows);
  }, []);

  const parsedTags = useMemo(
    () => formState.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
    [formState.tags]
  );

  const resetDateModal = () => {
    setEditingId(null);
    setFormState(EMPTY_FORM);
    setIsDateModalOpen(false);
  };

  const onSave = () => {
    startTransition(async () => {
      const payload = { ...formState, tags: parsedTags };
      const result = editingId
        ? await updateSmvRealDateHistoryAction(editingId, payload)
        : await createSmvRealDateHistoryAction(payload);

      if (!result.success) {
        alert(result.message);
        return;
      }

      resetDateModal();
      await loadHistory();
    });
  };

  const onEdit = (item: SmvRealDateHistoryRow) => {
    setEditingId(item.id);
    setFormState({
      title: item.title,
      date: item.date,
      reflection: item.reflection ?? '',
      tags: item.tags.join(', ')
    });
    setIsDateModalOpen(true);
  };

  const onDelete = (id: string) => {
    if (!confirm('ยืนยันการลบรายการนี้ใช่ไหม?')) return;

    startTransition(async () => {
      const result = await deleteSmvRealDateHistoryAction(id);
      if (!result.success) {
        alert(result.message);
        return;
      }
      await loadHistory();
    });
  };

  const targetCount = Math.max(reward?.target_count ?? 1, 1);
  const missionTitle = `เดทจริง ${targetCount} ครั้ง`;
  const progressPercent = Math.min((dateHistory.length / targetCount) * 100, 100);
  const isRewardClaimed = reward?.status === 'claimed';
  const rewardUnlocked = !isRewardClaimed && dateHistory.length >= targetCount;
  const unlockText = `ออกเดตจริง ${targetCount} ครั้งเพื่อปลดล็อก`;
  const refreshAfterRewardChange = () => {
    setRewardError(null);
    window.location.reload();
  };

  return (
    <section className="mx-auto w-full max-w-[1440px] space-y-6 px-8 pb-8 pt-6 md:pt-8">
      <section className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-[0_24px_60px_-36px_rgba(15,23,42,0.32)] md:p-6">
        <article className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-slate-50 p-5 shadow-[0_18px_40px_-32px_rgba(16,185,129,0.55)] sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold tracking-[0.08em] text-emerald-700">MISSION TRACKING</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">ประวัติเดทจริง</h2>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
                เดินหน้าอย่างต่อเนื่องด้วยการออกไปเดทจริง บันทึกประสบการณ์ และมองเห็นการเติบโตของตัวเองแบบชัดเจน
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:min-w-[320px]">
              <div className="rounded-2xl border border-white bg-white/85 p-4 shadow-[0_12px_28px_-24px_rgba(15,23,42,0.35)]">
                <p className="text-xs font-medium text-slate-500">เป้าหมาย</p>
                <p className="mt-1 text-lg font-semibold text-slate-950">{missionTitle}</p>
              </div>
              <div className="rounded-2xl border border-white bg-white/85 p-4 shadow-[0_12px_28px_-24px_rgba(15,23,42,0.35)]">
                <p className="text-xs font-medium text-slate-500">ปัจจุบัน</p>
                <p className="mt-1 text-lg font-semibold text-emerald-700">{dateHistory.length} ครั้ง</p>
              </div>
            </div>
          </div>
          <div className="mt-6">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-slate-600">Progress</span>
              <span className="font-semibold text-emerald-700">{progressPercent.toFixed(0)}%</span>
            </div>
            <div className="mt-2 h-4 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        </article>
      </section>

      <section className="overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-[0_20px_45px_-30px_rgba(15,23,42,0.24)]">
        <div className="grid grid-cols-1 md:grid-cols-[minmax(260px,0.9fr)_minmax(0,1.1fr)]">
          <div className="relative min-h-[230px] bg-slate-100 md:min-h-[330px]">
            {reward?.image_url && !isRewardClaimed ? (
              <Image src={reward.image_url} alt="" fill unoptimized className="object-cover object-center" sizes="(min-width: 768px) 44vw, 100vw" />
            ) : (
              <div className="flex h-full min-h-[230px] items-center justify-center bg-gradient-to-br from-slate-100 via-emerald-50 to-slate-200 px-6 text-center text-sm font-medium text-slate-500 md:min-h-[330px]">
                {isRewardClaimed ? 'รับรางวัลรอบนี้แล้ว' : 'ยังไม่มีรูปภาพรางวัล'}
              </div>
            )}
          </div>

          <div className="flex flex-col justify-between gap-5 p-5 md:p-6">
            <div>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold tracking-[0.02em] text-slate-500">รางวัลภารกิจชีวิต</p>
                  <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                    {isRewardClaimed ? 'รับรางวัลแล้ว' : reward ? reward.title : 'ยังไม่มีรางวัล'}
                  </h2>
                </div>
                <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${isRewardClaimed ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : rewardUnlocked ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-50 text-slate-600'}`}>
                  {isRewardClaimed ? 'claimed' : rewardUnlocked ? 'unlocked' : 'locked'}
                </span>
              </div>

              <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                <p className="text-xs font-semibold tracking-[0.02em] text-slate-500">เงื่อนไขปลดล็อก</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{unlockText}</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {isRewardClaimed ? `รอบภารกิจ ${missionTitle} ถูกปิดแล้ว` : reward?.emotional_copy || reward?.description || 'ตั้งรางวัลส่วนตัวเพื่อให้ภารกิจชีวิตนี้มีแรงดึงดูดมากขึ้น'}
                </p>
              </div>

              {!isRewardClaimed ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  <button type="button" onClick={() => setIsRewardModalOpen(true)} className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100">
                    {reward ? 'แก้ไขรางวัล' : '+ เพิ่มรางวัล'}
                  </button>
                  {reward ? (
                    <button type="button" onClick={() => {
                      if (!confirm('ลบรางวัลนี้ออกจากภารกิจชีวิต?')) return;
                      startTransition(async () => {
                        const result = await deleteSmvRewardAction();
                        if (!result.success) {
                          setRewardError(result.message);
                          return;
                        }
                        setReward(null);
                      });
                    }} className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100">
                      ลบรางวัล
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>

            {!isRewardClaimed && reward ? (
              <button type="button" disabled={!rewardUnlocked || isPending} onClick={() => {
                startTransition(async () => {
                  const result = await claimSmvRewardAction();
                  if (!result.success) {
                    setRewardError(result.message);
                    return;
                  }
                  refreshAfterRewardChange();
                });
              }} className="w-full rounded-xl bg-[#12233f] px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-55">
                {rewardUnlocked ? 'ยืนยันรับรางวัล' : unlockText}
              </button>
            ) : null}

            {rewardError ? <p className="text-xs text-rose-600">{rewardError}</p> : null}
          </div>
        </div>
      </section>

      <section className="rounded-[20px] border border-emerald-200 bg-emerald-50 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">รอบถัดไป</p>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">
              {isRewardClaimed ? 'เปิดเป้าหมายใหม่เพื่อปลดล็อกรางวัลรอบใหม่' : 'รับรางวัลรอบนี้ก่อน แล้วค่อยเริ่มรอบใหม่'}
            </p>
          </div>
          <button
            type="button"
            disabled={!isRewardClaimed || isPending}
            onClick={() => {
              startTransition(async () => {
                const result = await startNewSmvRewardRoundAction();
                if (!result.success) {
                  setRewardError(result.message);
                  return;
                }
                refreshAfterRewardChange();
              });
            }}
            className="rounded-xl bg-[#12233f] px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-55"
          >
            เริ่มภารกิจเดตรอบใหม่
          </button>
        </div>
      </section>

      <section className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-[0_20px_45px_-30px_rgba(15,23,42,0.24)] md:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-[0.02em] text-slate-500">ประวัติ</p>
            <h2 className="mt-1 text-xl font-semibold text-slate-900">ประวัติเดทจริง</h2>
          </div>
          <button type="button" onClick={() => setIsDateModalOpen(true)} className="rounded-xl bg-[#12233f] px-3 py-2 text-xs font-semibold text-white sm:px-4 sm:text-sm">+ เพิ่มเดทจริง</button>
        </div>

        <div className="mt-5 space-y-2.5">
          {dateHistory.length === 0 && !isPending ? (
            <article className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-5 text-center text-sm text-slate-500">
              ยังไม่มีประวัติเดท เริ่มบันทึกประสบการณ์จริงครั้งแรกของคุณ
            </article>
          ) : null}
          {dateHistory.map((item) => (
            <article key={item.id} className="rounded-2xl border border-slate-200/80 bg-slate-50/65 px-4 py-3.5 transition hover:bg-white">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-base font-semibold text-slate-900">{item.title}</h3>
                  <p className="mt-1 text-xs tracking-[0.02em] text-slate-500">{new Date(item.date).toLocaleDateString('th-TH', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.reflection ?? '-'}</p>
                  {item.tags.length ? <div className="mt-2.5 flex flex-wrap gap-1.5">{item.tags.map((tag) => <span key={tag} className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-500">{tag}</span>)}</div> : null}
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <button type="button" onClick={() => onEdit(item)} className="rounded-md px-2 py-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700">แก้ไข</button>
                  <button type="button" onClick={() => onDelete(item.id)} className="rounded-md px-2 py-1 text-rose-500 hover:bg-rose-50 hover:text-rose-600">ลบ</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-[0_20px_45px_-30px_rgba(15,23,42,0.24)] md:p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-slate-900">บันทึกสะท้อนคิด</h2>
          <button type="button" onClick={() => setIsReflectionOpen(true)} className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100">บันทึกสะท้อนคิด</button>
        </div>
        <p className="mt-5 border-l-2 border-slate-300 pl-4 text-base italic leading-8 text-slate-700">“{reflection}”</p>
        <p className="mt-4 text-xs tracking-[0.02em] text-slate-500">24 พฤษภาคม 2026</p>
      </section>

      <RewardFormModal
        open={isRewardModalOpen}
        levelId="smv_reward"
        defaultValues={{
          title: reward?.title ?? 'เที่ยวคนเดียว',
          description: reward?.description ?? 'ให้รางวัลกับตัวเองเมื่อกล้าเปิดชีวิตจริง',
          emotionalCopy: reward?.emotional_copy ?? 'ปลดล็อกเมื่อออกเดทจริงสำเร็จ 1 ครั้ง',
          imageUrl: reward?.image_url
        }}
        onClose={() => setIsRewardModalOpen(false)}
        onSubmit={(fd) => startTransition(async () => {
          const result = await upsertSmvRewardAction(fd);
          if (!result.success) {
            setRewardError(result.message);
            return;
          }
          setIsRewardModalOpen(false);
          refreshAfterRewardChange();
        })}
      />

      {isDateModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <button type="button" className="absolute inset-0 bg-slate-900/45" onClick={resetDateModal} />
          <div className="relative z-10 w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
            <h3 className="text-lg font-semibold text-slate-900">{editingId ? 'แก้ไขเดทจริง' : 'เพิ่มเดทจริง'}</h3>
            <div className="mt-3 space-y-3">
              <input value={formState.title} onChange={(e) => setFormState((prev) => ({ ...prev, title: e.target.value }))} placeholder="ชื่อเดท เช่น เดทครั้งแรก" className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none" />
              <input type="date" value={formState.date} onChange={(e) => setFormState((prev) => ({ ...prev, date: e.target.value }))} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none" />
              <textarea value={formState.reflection} onChange={(e) => setFormState((prev) => ({ ...prev, reflection: e.target.value }))} rows={4} placeholder="บันทึกสะท้อนคิด" className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none" />
              <input value={formState.tags} onChange={(e) => setFormState((prev) => ({ ...prev, tags: e.target.value }))} placeholder="แท็ก (คั่นด้วยเครื่องหมายจุลภาค)" className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none" />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={resetDateModal} className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600">ยกเลิก</button>
              <button type="button" onClick={onSave} disabled={isPending} className="rounded-lg bg-[#12233f] px-4 py-2 text-sm font-semibold text-white">บันทึก</button>
            </div>
          </div>
        </div>
      ) : null}

      {isReflectionOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <button type="button" className="absolute inset-0 bg-slate-900/45" onClick={() => setIsReflectionOpen(false)} />
          <div className="relative z-10 w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
            <h3 className="text-lg font-semibold text-slate-900">บันทึกสะท้อนคิด</h3>
            <textarea value={reflection} onChange={(event) => setReflection(event.target.value)} rows={5} className="mt-3 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none" />
            <div className="mt-4 flex justify-end">
              <button type="button" onClick={() => setIsReflectionOpen(false)} className="rounded-lg bg-[#12233f] px-4 py-2 text-sm font-semibold text-white">บันทึก</button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
