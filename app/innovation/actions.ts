'use server';

import { revalidatePath } from 'next/cache';

import {
  addDiscoveryCandidate,
  addInnovation,
  convertDiscoveryCandidateToInnovation,
  getInnovationDashboardData,
  getInnovationDashboardPageData,
  updateInnovationStepStatus
} from '@/lib/innovation/service';

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

export async function createDiscoveryCandidateAction(formData: FormData): Promise<{ success: boolean; message: string }> {
  const title = String(formData.get('title') ?? '').trim();
  const problem = String(formData.get('problem') ?? '').trim();
  const source = String(formData.get('source') ?? '').trim();
  const notes = String(formData.get('notes') ?? '').trim();
  const impactScoreRaw = Number(String(formData.get('impact_score') ?? '0').trim());
  const feasibilityScoreRaw = Number(String(formData.get('feasibility_score') ?? '0').trim());

  if (!title) {
    return { success: false, message: 'Candidate title is required.' };
  }

  await addDiscoveryCandidate({
    title,
    problem: problem || undefined,
    source: source || undefined,
    notes: notes || undefined,
    impact_score: Number.isFinite(impactScoreRaw) ? impactScoreRaw : 0,
    feasibility_score: Number.isFinite(feasibilityScoreRaw) ? feasibilityScoreRaw : 0
  });

  revalidatePath('/innovation');
  return { success: true, message: 'Discovery candidate added.' };
}

export async function convertDiscoveryCandidateAction(candidateId: string): Promise<{ success: boolean; message: string }> {
  const pageData = await getInnovationDashboardPageData();
  const candidate = pageData.discoveryCandidates.find((item) => item.id === candidateId);

  if (!candidate) {
    return { success: false, message: 'Candidate not found.' };
  }

  await convertDiscoveryCandidateToInnovation(candidate);
  revalidatePath('/innovation');
  return { success: true, message: 'Candidate promoted to innovation.' };
}

export async function markInnovationNextStepDoneAction(
  innovationId: string,
  stepId: string
): Promise<{ success: boolean; message: string }> {
  await updateInnovationStepStatus(stepId, innovationId, {
    status: 'done',
    completed_at: new Date().toISOString()
  });

  revalidatePath('/innovation');
  revalidatePath(`/innovation/${innovationId}`);

  return { success: true, message: 'Step marked done.' };
}
