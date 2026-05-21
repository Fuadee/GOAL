'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';

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

export function RelationshipMissionDashboard() {
  const [isReflectionOpen, setIsReflectionOpen] = useState(false);
  const [reflection, setReflection] = useState(
    'เริ่มเข้าใจแล้วว่าจริงๆ ตัวเองต้องการ connection แบบไหน และไม่อยากฝืนตัวเองไปอยู่ใน environment ที่ไม่ใช่'
  );
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formState, setFormState] = useState<DateFormState>(EMPTY_FORM);
  const [dateHistory, setDateHistory] = useState<SmvRealDateHistoryRow[]>([]);
  const [isPending, startTransition] = useTransition();

  const loadHistory = () => {
    startTransition(async () => {
      const rows = await listSmvRealDateHistoryAction();
      setDateHistory(rows);
    });
  };

  useEffect(() => {
    loadHistory();
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

  return (
    <section className="mx-auto w-full max-w-6xl space-y-4 px-4 pb-8 pt-6 md:px-6 md:pt-8">
      <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950 via-[#0b1420] to-[#142534] p-6 shadow-2xl shadow-black/25 md:p-8">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.2em] text-teal-200/80">Current Mission</p>
          <h1 className="text-3xl font-semibold text-white md:text-4xl">Go on 1 Real Date</h1>
          <p className="max-w-3xl text-sm leading-relaxed text-slate-300 md:text-base">เป้าหมายตอนนี้ไม่ใช่การมีแฟนทันที แต่คือการเปิดชีวิตตัวเองอีกครั้ง</p>
          <span className="inline-flex w-fit rounded-full border border-emerald-300/30 bg-emerald-300/15 px-3 py-1 text-xs font-medium text-emerald-100">IN PROGRESS</span>
        </div>
      </section>

      <section className="rounded-3xl border border-emerald-200/20 bg-[radial-gradient(circle_at_top,rgba(52,211,153,0.16),rgba(14,24,36,0.98)_52%)] p-5 shadow-xl shadow-emerald-950/20 md:p-5">
        <div className="space-y-3">
          <div className="pr-2">
            <h2 className="text-xs uppercase tracking-[0.2em] text-emerald-100/90">Success Condition</h2>
            <p className="mt-2 text-2xl font-semibold text-white md:text-[1.75rem]">REAL DATE HISTORY</p>
            <p className="mt-1 text-sm text-emerald-50/90">mission success = ออกไปใช้ชีวิตจริง แล้วเก็บประสบการณ์ความสัมพันธ์จริงแบบต่อเนื่อง</p>
          </div>
        </div>
      </section>

      <section>
        <article className="rounded-3xl border border-white/10 bg-[#0e1824] p-5 shadow-xl shadow-black/20 md:p-6">
          <h2 className="text-xs uppercase tracking-[0.2em] text-amber-200/90">Reward</h2>
          <h3 className="mt-2 text-2xl font-semibold text-white">เที่ยวคนเดียว</h3>
          <p className="mt-2 text-sm text-slate-300">ให้รางวัลกับตัวเองเมื่อเดินหน้าต่อเนื่องและกล้าออกไปใช้ชีวิตจริง</p>
          <div className="mt-4 h-36 rounded-2xl border border-white/10 bg-[linear-gradient(120deg,rgba(20,184,166,0.15),rgba(245,158,11,0.2)),url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center" />
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            {['Reset', 'Freedom', 'Growth', 'New Experience'].map((tag) => (
              <span key={tag} className="rounded-full border border-white/15 px-2.5 py-1 text-slate-200">{tag}</span>
            ))}
          </div>
          <p className="mt-4 text-sm text-slate-300">จังหวัดใกล้เคียงที่อยากไป</p>
          <p className="text-sm text-slate-400">ภูเก็ต • พังงา • เกาะลันตา • หรือที่ไหนก็ได้ที่สบายใจ</p>
        </article>
      </section>

      <section className="rounded-3xl border border-white/10 bg-[#0e1824] p-5 shadow-xl shadow-black/20 md:p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xs uppercase tracking-[0.2em] text-teal-200/80">Real Date History</h2>
          <button type="button" onClick={() => setIsDateModalOpen(true)} className="rounded-lg border border-teal-200/30 bg-teal-300/10 px-3 py-1.5 text-xs font-medium text-teal-100 hover:bg-teal-300/20">+ Add Real Date</button>
        </div>
        <div className="mt-4 space-y-3">
          {dateHistory.length === 0 && !isPending ? (
            <article className="rounded-2xl border border-dashed border-white/15 bg-slate-900/40 p-5 text-center text-sm text-slate-300">
              ยังไม่มี Date History — เริ่มบันทึกประสบการณ์จริงครั้งแรกของคุณ
            </article>
          ) : null}
          {dateHistory.map((item) => (
            <article key={item.id} className="rounded-2xl border border-white/10 bg-slate-900/50 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-medium text-white">{item.title}</h3>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">{new Date(item.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <button type="button" onClick={() => onEdit(item)} className="rounded-lg border border-white/20 px-2.5 py-1 text-slate-100 hover:bg-white/10">Edit</button>
                  <button type="button" onClick={() => onDelete(item.id)} className="rounded-lg border border-rose-300/30 px-2.5 py-1 text-rose-100 hover:bg-rose-300/10">Delete</button>
                </div>
              </div>
              <p className="mt-3 text-sm italic text-slate-100">“{item.reflection ?? '-'}”</p>
              {item.tags.length ? (
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  {item.tags.map((tag) => (
                    <span key={tag} className="rounded-full border border-white/15 px-2.5 py-1 text-slate-200">{tag}</span>
                  ))}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-[#0e1824] p-5 shadow-xl shadow-black/20 md:p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xs uppercase tracking-[0.2em] text-teal-200/80">Reflection</h2>
          <button type="button" onClick={() => setIsReflectionOpen(true)} className="rounded-lg border border-white/20 px-3 py-1.5 text-xs text-slate-200 hover:bg-white/5">บันทึก Reflection</button>
        </div>
        <p className="mt-3 text-sm text-slate-300">สะท้อน mindset จากทุก date history เพื่อเห็นแพทเทิร์นที่แท้จริงของหัวใจตัวเอง</p>
        <p className="mt-4 text-base italic text-slate-100">“{reflection}”</p>
        <p className="mt-3 text-xs text-slate-400">24 May 2026</p>
      </section>

      {isDateModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <button type="button" className="absolute inset-0 bg-black/70" onClick={resetDateModal} />
          <div className="relative z-10 w-full max-w-lg rounded-2xl border border-white/15 bg-slate-900 p-5">
            <h3 className="text-lg font-semibold text-white">{editingId ? 'Edit Real Date' : 'Add Real Date'}</h3>
            <div className="mt-3 space-y-3">
              <input value={formState.title} onChange={(e) => setFormState((prev) => ({ ...prev, title: e.target.value }))} placeholder="Date title เช่น Date #1" className="w-full rounded-xl border border-white/20 bg-slate-950 px-3 py-2 text-sm text-white" />
              <input type="date" value={formState.date} onChange={(e) => setFormState((prev) => ({ ...prev, date: e.target.value }))} className="w-full rounded-xl border border-white/20 bg-slate-950 px-3 py-2 text-sm text-white" />
              <textarea value={formState.reflection} onChange={(e) => setFormState((prev) => ({ ...prev, reflection: e.target.value }))} rows={4} placeholder="Reflection" className="w-full rounded-xl border border-white/20 bg-slate-950 px-3 py-2 text-sm text-white" />
              <input value={formState.tags} onChange={(e) => setFormState((prev) => ({ ...prev, tags: e.target.value }))} placeholder="Tags (คั่นด้วย comma)" className="w-full rounded-xl border border-white/20 bg-slate-950 px-3 py-2 text-sm text-white" />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={resetDateModal} className="rounded-lg border border-white/20 px-4 py-2 text-sm text-slate-200">Cancel</button>
              <button type="button" onClick={onSave} disabled={isPending} className="rounded-lg bg-teal-300 px-4 py-2 text-sm font-semibold text-slate-900">Save</button>
            </div>
          </div>
        </div>
      ) : null}

      <p className="pb-1 text-center text-sm text-slate-400">นี่คือบันทึกการเติบโตของชีวิตจริง ไม่ใช่ productivity dashboard</p>

      {isReflectionOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <button type="button" className="absolute inset-0 bg-black/70" onClick={() => setIsReflectionOpen(false)} />
          <div className="relative z-10 w-full max-w-lg rounded-2xl border border-white/15 bg-slate-900 p-5">
            <h3 className="text-lg font-semibold text-white">บันทึก Reflection</h3>
            <textarea value={reflection} onChange={(event) => setReflection(event.target.value)} rows={5} className="mt-3 w-full rounded-xl border border-white/20 bg-slate-950 px-3 py-2 text-sm text-white" />
            <div className="mt-4 flex justify-end">
              <button type="button" onClick={() => setIsReflectionOpen(false)} className="rounded-lg bg-teal-300 px-4 py-2 text-sm font-semibold text-slate-900">บันทึก</button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
