'use client';

import { FormEvent, useMemo, useState, useTransition } from 'react';

import { GoalVisionCard } from '@/components/dashboard/GoalVisionCard';
import { GOAL_VISION_ITEMS } from '@/lib/goal-vision/config';
import { DEFAULT_GOAL_VISION_USER_ID, GoalVisionImageRow, GoalVisionKey } from '@/lib/goal-vision/types';
import { PersonalTraitRow } from '@/lib/personal-traits/types';

type GoalVisionBoardProps = {
  initialImages: Array<GoalVisionImageRow & { image_url: string }>;
  initialTraits: PersonalTraitRow[];
  userId?: string;
};

type StateByKey = Partial<Record<GoalVisionKey, GoalVisionImageRow & { image_url: string }>>;

type BusyByKey = Partial<Record<GoalVisionKey, boolean>>;

type PersonalTrait = {
  id: string;
  title: string;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
};

const mapTraitRowToUi = (row: PersonalTraitRow): PersonalTrait => ({
  id: row.id,
  title: row.title,
  description: row.description,
  isActive: row.is_active,
  sortOrder: row.sort_order
});

export function GoalVisionBoard({ initialImages, initialTraits, userId = DEFAULT_GOAL_VISION_USER_ID }: GoalVisionBoardProps) {
  const initialState = useMemo<StateByKey>(() => {
    return initialImages.reduce<StateByKey>((acc, row) => {
      acc[row.goal_key] = row;
      return acc;
    }, {});
  }, [initialImages]);

  const [imagesByKey, setImagesByKey] = useState<StateByKey>(initialState);
  const [uploading, setUploading] = useState<BusyByKey>({});
  const [removing, setRemoving] = useState<BusyByKey>({});
  const [message, setMessage] = useState<string | null>(null);
  const [traits, setTraits] = useState<PersonalTrait[]>(() => initialTraits.map(mapTraitRowToUi));
  const [isTraitModalOpen, setIsTraitModalOpen] = useState(false);
  const [newTraitTitle, setNewTraitTitle] = useState('');
  const [newTraitDescription, setNewTraitDescription] = useState('');
  const [, startTransition] = useTransition();

  const setBusy = (setter: (value: BusyByKey | ((prev: BusyByKey) => BusyByKey)) => void, key: GoalVisionKey, value: boolean) => {
    setter((prev) => ({ ...prev, [key]: value }));
  };

  const uploadImage = (goalKey: GoalVisionKey, file: File) => {
    setMessage(null);
    setBusy(setUploading, goalKey, true);

    startTransition(async () => {
      try {
        if (!file.type.startsWith('image/')) throw new Error('Only image files are allowed.');

        const formData = new FormData();
        formData.set('goalKey', goalKey);
        formData.set('userId', userId);
        formData.set('file', file);

        const response = await fetch('/api/goal-vision-images', { method: 'POST', body: formData });
        const payload = (await response.json()) as {
          success: boolean;
          message?: string;
          data?: GoalVisionImageRow & { image_url: string };
        };

        if (!response.ok || !payload.success || !payload.data) {
          throw new Error(payload.message ?? 'Upload failed.');
        }

        setImagesByKey((prev) => ({ ...prev, [goalKey]: payload.data as GoalVisionImageRow & { image_url: string } }));
      } catch (error) {
        setMessage(error instanceof Error ? error.message : 'Upload failed.');
      } finally {
        setBusy(setUploading, goalKey, false);
      }
    });
  };

  const removeImage = (goalKey: GoalVisionKey) => {
    setMessage(null);
    setBusy(setRemoving, goalKey, true);

    startTransition(async () => {
      try {
        const response = await fetch('/api/goal-vision-images', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ goalKey, userId })
        });

        const payload = (await response.json()) as { success: boolean; message?: string };

        if (!response.ok || !payload.success) {
          throw new Error(payload.message ?? 'Remove failed.');
        }

        setImagesByKey((prev) => {
          const next = { ...prev };
          delete next[goalKey];
          return next;
        });
      } catch (error) {
        setMessage(error instanceof Error ? error.message : 'Remove failed.');
      } finally {
        setBusy(setRemoving, goalKey, false);
      }
    });
  };

  const toggleTrait = (traitId: string) => {
    setMessage(null);
    const snapshot = traits;
    setTraits((prev) => prev.map((trait) => (trait.id === traitId ? { ...trait, isActive: !trait.isActive } : trait)));

    startTransition(async () => {
      try {
        const response = await fetch('/api/personal-traits', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: traitId, mode: 'toggle' })
        });
        const payload = (await response.json()) as { success: boolean; message?: string; data?: PersonalTraitRow };

        if (!response.ok || !payload.success || !payload.data) {
          throw new Error(payload.message ?? 'Toggle trait failed.');
        }

        const nextRow = mapTraitRowToUi(payload.data);
        setTraits((prev) => prev.map((trait) => (trait.id === traitId ? nextRow : trait)));
      } catch (error) {
        setTraits(snapshot);
        setMessage(error instanceof Error ? error.message : 'Toggle trait failed.');
      }
    });
  };

  const submitTrait = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedTitle = newTraitTitle.trim();
    if (!trimmedTitle) return;

    startTransition(async () => {
      try {
        const response = await fetch('/api/personal-traits', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: trimmedTitle,
            description: newTraitDescription.trim() || null,
            sort_order: traits.length
          })
        });

        const payload = (await response.json()) as { success: boolean; message?: string; data?: PersonalTraitRow };
        const createdTrait = payload.data;
        if (!response.ok || !payload.success || !createdTrait) {
          throw new Error(payload.message ?? 'Create trait failed.');
        }

        setTraits((prev) => [...prev, mapTraitRowToUi(createdTrait)]);
        setNewTraitTitle('');
        setNewTraitDescription('');
        setIsTraitModalOpen(false);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : 'Create trait failed.');
      }
    });
  };

  return (
    <section className="mission-card overflow-visible p-5 md:p-7">
      <div className="relative z-10 space-y-6">
        <div className="space-y-2">
          <p className="mission-label text-cyan-200/90">GOAL VISION BOARD</p>
          <h1 className="page-title text-3xl md:text-4xl">GOAL VISION BOARD</h1>
          <p className="text-base text-[color:var(--text-secondary)]">ภาพแทนเป้าหมายสูงสุดของคุณในแต่ละด้าน</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {GOAL_VISION_ITEMS.map((item) => (
            <GoalVisionCard
              key={item.key}
              item={item}
              imageUrl={imagesByKey[item.key]?.image_url ?? null}
              isUploading={Boolean(uploading[item.key])}
              isRemoving={Boolean(removing[item.key])}
              onUpload={(file) => uploadImage(item.key, file)}
              onRemove={() => removeImage(item.key)}
            />
          ))}
        </div>

        <div className="space-y-4 rounded-3xl border border-white/10 bg-slate-950/30 p-4 md:p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-white">คุณสมบัติของตัวตน (Personal Traits)</h2>
              <p className="text-sm text-[color:var(--text-muted)]">เลือกโหมดชีวิตที่อยากเป็นในช่วงนี้ โดยไม่ผูกกับ task หรือคะแนน</p>
            </div>
            <button
              type="button"
              onClick={() => setIsTraitModalOpen(true)}
              className="inline-flex items-center justify-center rounded-2xl border border-cyan-300/30 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:border-cyan-200/60 hover:bg-cyan-400/15"
            >
              + เพิ่มคุณสมบัติ
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {traits.map((trait) => (
              <button
                key={trait.id}
                type="button"
                onClick={() => toggleTrait(trait.id)}
                className={`group relative min-h-[212px] rounded-2xl border p-4 text-left transition-all duration-200 ease-out active:scale-[0.98] ${
                  trait.isActive
                    ? 'border-violet-300/40 bg-gradient-to-br from-blue-950/95 via-indigo-900/90 to-violet-900/90 text-white shadow-[0_0_0_1px_rgba(129,140,248,0.2),0_0_26px_rgba(99,102,241,0.28)]'
                    : 'border-white/10 bg-slate-900/80 text-slate-200 opacity-70'
                }`}
              >
                <span
                  className={`absolute right-3 top-3 rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${
                    trait.isActive
                      ? 'border-emerald-300/50 bg-emerald-400/15 text-emerald-100'
                      : 'border-slate-400/35 bg-slate-500/20 text-slate-300'
                  }`}
                >
                  {trait.isActive ? 'Active' : 'Off'}
                </span>
                <div className="flex h-full flex-col justify-end gap-2">
                  <h3 className="text-lg font-bold uppercase tracking-[0.04em]">{trait.title}</h3>
                  <p className={`text-xs leading-relaxed ${trait.isActive ? 'text-slate-100/85' : 'text-slate-400'}`}>
                    {trait.description || 'คุณสมบัตินี้พร้อมเปิดใช้งานเมื่อคุณต้องการ'}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {message ? <p className="text-sm text-rose-300">{message}</p> : null}
      </div>

      {isTraitModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8" role="dialog" aria-modal="true">
          <button
            type="button"
            aria-label="Close modal backdrop"
            className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm"
            onClick={() => setIsTraitModalOpen(false)}
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/15 bg-slate-950/95 p-5 shadow-2xl">
            <h3 className="text-lg font-semibold text-white">เพิ่มคุณสมบัติของตัวตน</h3>
            <p className="mt-1 text-sm text-[color:var(--text-secondary)]">โฟกัสสิ่งที่อยากเป็น ไม่ใช่สิ่งที่ต้องทำ</p>

            <form className="mt-4 space-y-3" onSubmit={submitTrait}>
              <label className="block space-y-1">
                <span className="text-xs font-medium uppercase tracking-[0.1em] text-slate-300">Title</span>
                <input
                  value={newTraitTitle}
                  onChange={(event) => setNewTraitTitle(event.target.value)}
                  placeholder="เช่น EARLY RISER"
                  className="theme-input"
                  maxLength={60}
                  required
                />
              </label>

              <label className="block space-y-1">
                <span className="text-xs font-medium uppercase tracking-[0.1em] text-slate-300">Description</span>
                <textarea
                  value={newTraitDescription}
                  onChange={(event) => setNewTraitDescription(event.target.value)}
                  placeholder="คำอธิบายสั้น ๆ ว่า trait นี้หมายถึงอะไรสำหรับคุณ"
                  className="theme-textarea min-h-[100px]"
                  maxLength={220}
                />
              </label>

              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={() => setIsTraitModalOpen(false)} className="theme-button-secondary">
                  ยกเลิก
                </button>
                <button type="submit" className="theme-button-primary">
                  บันทึกคุณสมบัติ
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}
