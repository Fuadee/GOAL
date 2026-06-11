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

const VISION_TRAIT_TITLE_TRANSLATIONS: Record<string, string> = {
  'Kill Mini Entertainment': 'ลดความบันเทิงไร้สาระ',
  'Kill Your Wrong Happiness': 'ลดความสุขผิดทาง',
  'SLEEP CYCLE': 'วงจรการนอน',
  'Sleep Cycle': 'วงจรการนอน',
  'FULL WATER': 'ดื่มน้ำให้พอ',
  'FULL WATER ALL DAY': 'ดื่มน้ำให้พอตลอดวัน',
  '100 THINK': 'คิดให้ชัดก่อนทำ'
};

const translateVisionTraitTitle = (title: string) => VISION_TRAIT_TITLE_TRANSLATIONS[title] ?? title;

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
        if (!file.type.startsWith('image/')) throw new Error('อัปโหลดได้เฉพาะไฟล์รูปภาพ');

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
          throw new Error(payload.message ?? 'อัปโหลดไม่สำเร็จ');
        }

        setImagesByKey((prev) => ({ ...prev, [goalKey]: payload.data as GoalVisionImageRow & { image_url: string } }));
      } catch (error) {
        setMessage(error instanceof Error ? error.message : 'อัปโหลดไม่สำเร็จ');
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
          throw new Error(payload.message ?? 'ลบรูปไม่สำเร็จ');
        }

        setImagesByKey((prev) => {
          const next = { ...prev };
          delete next[goalKey];
          return next;
        });
      } catch (error) {
        setMessage(error instanceof Error ? error.message : 'ลบรูปไม่สำเร็จ');
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
          throw new Error(payload.message ?? 'อัปเดตคุณสมบัติไม่สำเร็จ');
        }

        const nextRow = mapTraitRowToUi(payload.data);
        setTraits((prev) => prev.map((trait) => (trait.id === traitId ? nextRow : trait)));
      } catch (error) {
        setTraits(snapshot);
        setMessage(error instanceof Error ? error.message : 'อัปเดตคุณสมบัติไม่สำเร็จ');
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
          throw new Error(payload.message ?? 'สร้างคุณสมบัติไม่สำเร็จ');
        }

        setTraits((prev) => [...prev, mapTraitRowToUi(createdTrait)]);
        setNewTraitTitle('');
        setNewTraitDescription('');
        setIsTraitModalOpen(false);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : 'สร้างคุณสมบัติไม่สำเร็จ');
      }
    });
  };

  return (
    <section className="hero-panel overflow-visible border-[color:var(--border-strong)]/45 p-5 md:p-7">
      <div className="relative z-10 space-y-6">
        <div className="mb-1">
          <h1 className="text-base font-semibold tracking-[0.01em] text-[color:var(--text-primary)] sm:text-lg">บอร์ดวิสัยทัศน์</h1>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1 sm:gap-4 md:grid-cols-2 xl:grid-cols-5">
          {GOAL_VISION_ITEMS.map((item) => (
            <div key={item.key} className="min-w-0">
              <GoalVisionCard
                item={item}
                imageUrl={imagesByKey[item.key]?.image_url ?? null}
                isUploading={Boolean(uploading[item.key])}
                isRemoving={Boolean(removing[item.key])}
                onUpload={(file) => uploadImage(item.key, file)}
                onRemove={() => removeImage(item.key)}
              />
            </div>
          ))}
        </div>

        <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-[color:var(--text-primary)]">คุณสมบัติของตัวตน</h2>
              <p className="text-sm text-[color:var(--text-secondary)]">เลือกโหมดชีวิตที่อยากเป็นในช่วงนี้ โดยไม่ผูกกับงานหรือคะแนน</p>
            </div>
            <button
              type="button"
              onClick={() => setIsTraitModalOpen(true)}
              className="theme-button-primary rounded-2xl"
            >
              + เพิ่มคุณสมบัติ
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {traits.map((trait) => (
              <button
                key={trait.id}
                type="button"
                onClick={() => toggleTrait(trait.id)}
                className={`group relative min-h-[120px] max-h-[140px] rounded-2xl border p-4 text-left transition-all duration-200 ease-out active:scale-[0.98] ${
                  trait.isActive
                    ? 'border-violet-200 bg-violet-50 text-[color:var(--text-primary)] shadow-sm'
                    : 'border-slate-200 bg-white text-[color:var(--text-primary)] shadow-sm hover:border-blue-200 hover:bg-blue-50/40'
                }`}
              >
                <span
                  className={`absolute right-3 top-3 rounded-full border px-2 py-1 text-xs font-semibold ${
                    trait.isActive
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'border-slate-200 bg-slate-50 text-slate-600'
                  }`}
                >
                  {trait.isActive ? 'เปิดใช้' : 'ปิดอยู่'}
                </span>
                <div className="flex h-full flex-col justify-end gap-1.5">
                  <h3 className="text-sm font-semibold tracking-[0.01em] md:text-base">{translateVisionTraitTitle(trait.title)}</h3>
                  <p className={`text-xs leading-relaxed ${trait.isActive ? 'text-[color:var(--text-secondary)]' : 'text-[color:var(--text-muted)]'}`}>
                    {trait.description || 'คุณสมบัตินี้พร้อมเปิดใช้เมื่อคุณต้องการ'}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {message ? <p className="text-sm text-red-600">{message}</p> : null}
      </div>

      {isTraitModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8" role="dialog" aria-modal="true">
          <button
            type="button"
            aria-label="ปิดหน้าต่างเพิ่มคุณสมบัติ"
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            onClick={() => setIsTraitModalOpen(false)}
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
            <h3 className="text-lg font-semibold text-[color:var(--text-primary)]">เพิ่มคุณสมบัติของตัวตน</h3>
            <p className="mt-1 text-sm text-[color:var(--text-secondary)]">โฟกัสสิ่งที่อยากเป็น ไม่ใช่สิ่งที่ต้องทำ</p>

            <form className="mt-4 space-y-3" onSubmit={submitTrait}>
              <label className="block space-y-1">
                <span className="text-xs font-medium text-[color:var(--text-secondary)]">ชื่อคุณสมบัติ</span>
                <input
                  value={newTraitTitle}
                  onChange={(event) => setNewTraitTitle(event.target.value)}
                  placeholder="เช่น ตื่นเช้าเป็นธรรมชาติ"
                  className="theme-input"
                  maxLength={60}
                  required
                />
              </label>

              <label className="block space-y-1">
                <span className="text-xs font-medium text-[color:var(--text-secondary)]">คำอธิบาย</span>
                <textarea
                  value={newTraitDescription}
                  onChange={(event) => setNewTraitDescription(event.target.value)}
                  placeholder="คำอธิบายสั้น ๆ ว่าคุณสมบัตินี้หมายถึงอะไรสำหรับคุณ"
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
