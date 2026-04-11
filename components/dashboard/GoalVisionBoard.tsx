'use client';

import { useMemo, useState, useTransition } from 'react';

import { GoalVisionCard } from '@/components/dashboard/GoalVisionCard';
import { GOAL_VISION_ITEMS } from '@/lib/goal-vision/config';
import { DEFAULT_GOAL_VISION_USER_ID, GoalVisionImageRow, GoalVisionKey } from '@/lib/goal-vision/types';

type GoalVisionBoardProps = {
  initialImages: Array<GoalVisionImageRow & { image_url: string }>;
  userId?: string;
};

type StateByKey = Partial<Record<GoalVisionKey, GoalVisionImageRow & { image_url: string }>>;

type BusyByKey = Partial<Record<GoalVisionKey, boolean>>;

export function GoalVisionBoard({ initialImages, userId = DEFAULT_GOAL_VISION_USER_ID }: GoalVisionBoardProps) {
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

        {message ? <p className="text-sm text-rose-300">{message}</p> : null}
      </div>
    </section>
  );
}
