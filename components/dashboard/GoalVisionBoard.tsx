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

type PersonalTrait = { id: string; title: string; description: string | null; isActive: boolean; sortOrder: number };

const mapTraitRowToUi = (row: PersonalTraitRow): PersonalTrait => ({
  id: row.id,
  title: row.title,
  description: row.description,
  isActive: row.is_active,
  sortOrder: row.sort_order
});

export function GoalVisionBoard({ initialImages, initialTraits, userId = DEFAULT_GOAL_VISION_USER_ID }: GoalVisionBoardProps) {
  const initialState = useMemo<StateByKey>(() => initialImages.reduce<StateByKey>((acc, row) => ((acc[row.goal_key] = row), acc), {}), [initialImages]);
  const [imagesByKey, setImagesByKey] = useState<StateByKey>(initialState);
  const [uploading, setUploading] = useState<BusyByKey>({});
  const [removing, setRemoving] = useState<BusyByKey>({});
  const [message, setMessage] = useState<string | null>(null);
  const [traits, setTraits] = useState<PersonalTrait[]>(() => initialTraits.map(mapTraitRowToUi));
  const [isTraitModalOpen, setIsTraitModalOpen] = useState(false);
  const [newTraitTitle, setNewTraitTitle] = useState('');
  const [newTraitDescription, setNewTraitDescription] = useState('');
  const [, startTransition] = useTransition();

  const setBusy = (setter: (value: BusyByKey | ((prev: BusyByKey) => BusyByKey)) => void, key: GoalVisionKey, value: boolean) => setter((prev) => ({ ...prev, [key]: value }));

  const uploadImage = (goalKey: GoalVisionKey, file: File) => { /* unchanged logic */
    setMessage(null); setBusy(setUploading, goalKey, true);
    startTransition(async () => {
      try {
        if (!file.type.startsWith('image/')) throw new Error('Only image files are allowed.');
        const formData = new FormData(); formData.set('goalKey', goalKey); formData.set('userId', userId); formData.set('file', file);
        const response = await fetch('/api/goal-vision-images', { method: 'POST', body: formData });
        const payload = (await response.json()) as { success: boolean; message?: string; data?: GoalVisionImageRow & { image_url: string } };
        if (!response.ok || !payload.success || !payload.data) throw new Error(payload.message ?? 'Upload failed.');
        setImagesByKey((prev) => ({ ...prev, [goalKey]: payload.data as GoalVisionImageRow & { image_url: string } }));
      } catch (error) { setMessage(error instanceof Error ? error.message : 'Upload failed.'); } finally { setBusy(setUploading, goalKey, false); }
    });
  };

  const removeImage = (goalKey: GoalVisionKey) => {
    setMessage(null); setBusy(setRemoving, goalKey, true);
    startTransition(async () => {
      try {
        const response = await fetch('/api/goal-vision-images', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ goalKey, userId }) });
        const payload = (await response.json()) as { success: boolean; message?: string };
        if (!response.ok || !payload.success) throw new Error(payload.message ?? 'Remove failed.');
        setImagesByKey((prev) => { const next = { ...prev }; delete next[goalKey]; return next; });
      } catch (error) { setMessage(error instanceof Error ? error.message : 'Remove failed.'); } finally { setBusy(setRemoving, goalKey, false); }
    });
  };

  const toggleTrait = (traitId: string) => {
    setMessage(null); const snapshot = traits;
    setTraits((prev) => prev.map((trait) => (trait.id === traitId ? { ...trait, isActive: !trait.isActive } : trait)));
    startTransition(async () => {
      try {
        const response = await fetch('/api/personal-traits', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: traitId, mode: 'toggle' }) });
        const payload = (await response.json()) as { success: boolean; message?: string; data?: PersonalTraitRow };
        if (!response.ok || !payload.success || !payload.data) throw new Error(payload.message ?? 'Toggle trait failed.');
        const nextRow = mapTraitRowToUi(payload.data);
        setTraits((prev) => prev.map((trait) => (trait.id === traitId ? nextRow : trait)));
      } catch (error) { setTraits(snapshot); setMessage(error instanceof Error ? error.message : 'Toggle trait failed.'); }
    });
  };

  const submitTrait = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const trimmedTitle = newTraitTitle.trim(); if (!trimmedTitle) return;
    startTransition(async () => {
      try {
        const response = await fetch('/api/personal-traits', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: trimmedTitle, description: newTraitDescription.trim() || null, sort_order: traits.length }) });
        const payload = (await response.json()) as { success: boolean; message?: string; data?: PersonalTraitRow };
        if (!response.ok || !payload.success || !payload.data) throw new Error(payload.message ?? 'Create trait failed.');
        setTraits((prev) => [...prev, mapTraitRowToUi(payload.data!)]);
        setNewTraitTitle(''); setNewTraitDescription(''); setIsTraitModalOpen(false);
      } catch (error) { setMessage(error instanceof Error ? error.message : 'Create trait failed.'); }
    });
  };

  const primaryItem = GOAL_VISION_ITEMS[0];
  const activeTraits = traits.filter((trait) => trait.isActive);

  return (
    <section className="space-y-10">
      <article className="overflow-hidden rounded-[28px] border border-[#DDE3D5] bg-[#0e1116] p-4 md:p-6">
        <div className="mb-5 space-y-2 md:mb-6">
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#c2a56d]">Personal Operating Space</p>
          <h1 className="text-3xl font-medium leading-tight text-[#f3f2ef] md:text-5xl">Build your life deliberately.</h1>
          <p className="max-w-2xl text-sm text-[#b8b8b2] md:text-base">One calm system for clarity, discipline, and meaningful progress.</p>
        </div>
        <GoalVisionCard
          item={primaryItem}
          imageUrl={imagesByKey[primaryItem.key]?.image_url ?? null}
          isUploading={Boolean(uploading[primaryItem.key])}
          isRemoving={Boolean(removing[primaryItem.key])}
          onUpload={(file) => uploadImage(primaryItem.key, file)}
          onRemove={() => removeImage(primaryItem.key)}
        />
      </article>

      <section className="space-y-4 border-t border-[#DDE3D5] pt-8">
        <div className="flex items-end justify-between">
          <h2 className="text-lg font-medium text-[#f3f2ef]">Identity</h2>
          <button type="button" onClick={() => setIsTraitModalOpen(true)} className="rounded-full border border-[#DDE3D5] px-4 py-2 text-xs text-[#d7d6d2] hover:border-[#c2a56d]/50">Add tag</button>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {traits.map((trait) => (
            <button key={trait.id} type="button" onClick={() => toggleTrait(trait.id)} className={`rounded-full border px-4 py-2 text-sm transition ${trait.isActive ? 'border-[#c2a56d]/55 bg-[#c2a56d]/10 text-[#eee7d9]' : 'border-[#DDE3D5] text-[#a8a8a1]'}`}>
              {trait.isActive ? '✓ ' : ''}{trait.title}
            </button>
          ))}
          {!traits.length ? <p className="text-sm text-[#9d9c96]">No identity tags yet.</p> : null}
        </div>
        {activeTraits.length > 0 ? <p className="text-xs text-[#8d8c87]">Active mode: {activeTraits.map((t) => t.title).join(' · ')}</p> : null}
      </section>

      {message ? <p className="text-sm text-rose-300">{message}</p> : null}

      {isTraitModalOpen ? <div className="fixed inset-0 z-50 flex items-center justify-center px-4"><button type="button" className="absolute inset-0 bg-black/65" onClick={() => setIsTraitModalOpen(false)} /><div className="relative z-10 w-full max-w-md rounded-2xl border border-[#DDE3D5] bg-[#11151c] p-5"><h3 className="text-lg text-[#f5f2ea]">Add Identity Tag</h3><form className="mt-4 space-y-3" onSubmit={submitTrait}><input value={newTraitTitle} onChange={(e) => setNewTraitTitle(e.target.value)} placeholder="Deep Work" className="theme-input" maxLength={60} required/><textarea value={newTraitDescription} onChange={(e) => setNewTraitDescription(e.target.value)} placeholder="Optional meaning" className="theme-textarea min-h-[90px]" maxLength={220}/><div className="flex justify-end gap-2"><button type="button" onClick={() => setIsTraitModalOpen(false)} className="theme-button-secondary">Cancel</button><button type="submit" className="theme-button-primary">Save</button></div></form></div></div> : null}
    </section>
  );
}
