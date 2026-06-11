'use client';

import { useCallback, useMemo, useState, useTransition } from 'react';

import {
  createSmvRealDateHistoryAction,
  deleteSmvRealDateHistoryAction,
  listSmvRealDateHistoryAction,
  updateSmvRealDateHistoryAction
} from '@/app/smv/actions';
import { SmvRealDateHistoryRow } from '@/lib/smv/types';

type DateFormState = {
  title: string;
  date: string;
  reflection: string;
  tags: string;
};

const EMPTY_FORM: DateFormState = { title: '', date: '', reflection: '', tags: '' };

export function RelationshipMissionDashboard({ initialDateHistory = [] }: { initialDateHistory?: SmvRealDateHistoryRow[] }) {
  const [isReflectionOpen, setIsReflectionOpen] = useState(false);
  const [reflection, setReflection] = useState(
    'เริ่มเข้าใจแล้วว่าจริง ๆ ตัวเองต้องการความสัมพันธ์แบบไหน และไม่อยากฝืนตัวเองไปอยู่ในสภาพแวดล้อมที่ไม่ใช่'
  );
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formState, setFormState] = useState<DateFormState>(EMPTY_FORM);
  const [dateHistory, setDateHistory] = useState<SmvRealDateHistoryRow[]>(initialDateHistory);
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

  const progressPercent = Math.min((dateHistory.length / 1) * 100, 100);
  const rewardUnlocked = progressPercent >= 100;

  return (
    <section className="mx-auto w-full max-w-[1440px] space-y-6 px-4 pb-8 pt-6 md:px-6 md:pt-8">
      <section className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-[0_20px_45px_-30px_rgba(15,23,42,0.24)] md:p-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <article className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
            <p className="text-xs font-semibold tracking-[0.02em] text-slate-500">ความคืบหน้าภารกิจ</p>
            <h2 className="mt-2 text-lg font-semibold text-slate-900">ประวัติเดทจริง</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">เดินหน้าอย่างต่อเนื่องด้วยการออกไปเดทจริง บันทึกประสบการณ์ และมองเห็นการเติบโตของตัวเองแบบชัดเจน</p>
            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">เป้าหมาย</span>
                <span className="font-semibold text-slate-800">เดทจริง 1 ครั้ง</span>
              </div>
              <div className="mt-1.5 flex items-center justify-between text-sm">
                <span className="text-slate-500">ปัจจุบัน</span>
                <span className="font-semibold text-emerald-600">{dateHistory.length} ครั้ง</span>
              </div>
              <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>
          </article>

          <article className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-indigo-50 via-sky-50 to-cyan-50 p-4 shadow-[0_16px_34px_-28px_rgba(15,23,42,0.45)] sm:p-5">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold tracking-[0.02em] text-slate-600">รางวัล</p>
              <span className="rounded-full border border-white/70 bg-white/70 px-2.5 py-1 text-[10px] font-semibold text-slate-600">รางวัลส่วนตัว</span>
            </div>
            <div className="h-28 rounded-xl border border-white/70 bg-[linear-gradient(120deg,rgba(20,184,166,0.12),rgba(245,158,11,0.16)),url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center" />
            <h3 className="mt-3 text-xl font-semibold text-slate-900">เที่ยวคนเดียว</h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">ให้รางวัลกับตัวเองเมื่อกล้าเปิดชีวิตจริง</p>
            <div className="mt-3 flex flex-wrap gap-1.5 text-[11px]">
              {['รีเซ็ต', 'อิสระ', 'การเติบโต', 'ประสบการณ์ใหม่'].map((tag) => (
                <span key={tag} className="rounded-full border border-slate-200/80 bg-white/70 px-2.5 py-1 text-slate-500">{tag}</span>
              ))}
            </div>
            <div className={`mt-3 flex items-center justify-between rounded-xl border px-3 py-2.5 text-sm font-medium ${rewardUnlocked ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-100 text-slate-600'}`}>
              <span>{rewardUnlocked ? 'ปลดล็อกแล้ว' : 'ยังล็อกอยู่'}</span>
              <span>{progressPercent.toFixed(0)}%</span>
            </div>
          </article>
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
          {dateHistory.length === 0 && !isPending ? <article className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-5 text-center text-sm text-slate-500">ยังไม่มีประวัติเดท เริ่มบันทึกประสบการณ์จริงครั้งแรกของคุณ</article> : null}
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
