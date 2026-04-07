'use server';

import { revalidatePath } from 'next/cache';

import { addInnovation, getInnovationDashboardData } from '@/lib/innovation/service';

export async function createInnovationAction(formData: FormData): Promise<{ success: boolean; message: string }> {
  const title = String(formData.get('title') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const goal = String(formData.get('goal') ?? '').trim();

  if (!title) {
    return { success: false, message: 'Title is required.' };
  }

  const innovations = await getInnovationDashboardData();
  if (innovations.length >= 10) {
    return { success: false, message: 'Maximum 10 innovations reached.' };
  }

  await addInnovation({
    title,
    description: description || undefined,
    goal: goal || undefined
  });

  revalidatePath('/innovation');
  return { success: true, message: 'Innovation created.' };
}
