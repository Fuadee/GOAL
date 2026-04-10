'use server';

import { revalidatePath } from 'next/cache';

import {
  addCandidateConcept,
  addDiscoveryCandidate,
  addInnovation,
  addInnovationProcessStep,
  blockInnovation,
  convertDiscoveryCandidateToInnovation,
  defineCandidateProblem,
  getDiscoveryCandidateDetailData,
  getInnovationDashboardData,
  getInnovationDashboardPageData,
  markCandidateValidated,
  markInnovationNextStepDone,
  removeDiscoveryCandidate,
  resumeInnovation,
  updateCandidateConcept,
  updateCandidateProblem,
  updateInnovationBlockedReason
} from '@/lib/innovation/service';

function revalidateInnovationPages(pathname?: string) {
  revalidatePath('/innovation');
  revalidatePath('/innovation/discovery/new');
  if (pathname) {
    revalidatePath(pathname);
  }
}

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

  revalidateInnovationPages();
  return { success: true, message: 'Innovation created.' };
}

export async function createDiscoveryCandidateAction(
  formData: FormData
): Promise<{ success: boolean; message: string; candidateId?: string }> {
  const title = String(formData.get('title') ?? '').trim();
  const source = String(formData.get('source') ?? '').trim();
  const problem = String(formData.get('problem') ?? '').trim();
  const concept = String(formData.get('concept') ?? '').trim();
  const notes = String(formData.get('notes') ?? '').trim();
  const impactScoreRaw = Number(String(formData.get('impact_score') ?? '0').trim());
  const feasibilityScoreRaw = Number(String(formData.get('feasibility_score') ?? '0').trim());

  if (!title) {
    return { success: false, message: 'Candidate title is required.' };
  }

  const created = await addDiscoveryCandidate({
    title,
    source: source || undefined,
    problem: problem || undefined,
    concept: concept || undefined,
    notes: notes || undefined,
    impact_score: Number.isFinite(impactScoreRaw) ? impactScoreRaw : 0,
    feasibility_score: Number.isFinite(feasibilityScoreRaw) ? feasibilityScoreRaw : 0
  });

  revalidateInnovationPages('/innovation/discovery/new');
  return { success: true, message: 'Discovery candidate added.', candidateId: created.id };
}

export async function defineCandidateProblemAction(candidateId: string, problem: string): Promise<{ success: boolean; message: string }> {
  const problemText = problem.trim();

  if (!problemText) {
    return { success: false, message: 'Problem is required.' };
  }

  await defineCandidateProblem(candidateId, problemText);
  revalidateInnovationPages(`/innovation/discovery/${candidateId}`);

  return { success: true, message: 'Problem defined.' };
}

export async function updateCandidateProblemAction(candidateId: string, problem: string): Promise<{ success: boolean; message: string }> {
  const problemText = problem.trim();

  if (!problemText) {
    return { success: false, message: 'Problem is required.' };
  }

  await updateCandidateProblem(candidateId, problemText);
  revalidateInnovationPages(`/innovation/discovery/${candidateId}`);

  return { success: true, message: 'Problem updated.' };
}

export async function addCandidateConceptAction(candidateId: string, concept: string): Promise<{ success: boolean; message: string }> {
  const conceptText = concept.trim();

  if (!conceptText) {
    return { success: false, message: 'Concept is required.' };
  }

  await addCandidateConcept(candidateId, conceptText);
  revalidateInnovationPages(`/innovation/discovery/${candidateId}`);

  return { success: true, message: 'Concept added.' };
}

export async function updateCandidateConceptAction(candidateId: string, concept: string): Promise<{ success: boolean; message: string }> {
  const conceptText = concept.trim();

  if (!conceptText) {
    return { success: false, message: 'Concept is required.' };
  }

  await updateCandidateConcept(candidateId, conceptText);
  revalidateInnovationPages(`/innovation/discovery/${candidateId}`);

  return { success: true, message: 'Concept updated.' };
}

export async function markCandidateValidatedAction(candidateId: string, validationNotes?: string): Promise<{ success: boolean; message: string }> {
  await markCandidateValidated(candidateId, validationNotes?.trim());
  revalidateInnovationPages(`/innovation/discovery/${candidateId}`);

  return { success: true, message: 'Candidate validated.' };
}

export async function updateCandidateValidationNotesAction(candidateId: string, validationNotes: string): Promise<{ success: boolean; message: string }> {
  const candidate = await getDiscoveryCandidateDetailData(candidateId);

  if (!candidate) {
    return { success: false, message: 'Candidate not found.' };
  }

  await markCandidateValidatedAction(candidateId, validationNotes);
  return { success: true, message: 'Validation notes updated.' };
}

export async function deleteDiscoveryCandidateAction(candidateId: string): Promise<{ success: boolean; message: string }> {
  await removeDiscoveryCandidate(candidateId);
  revalidateInnovationPages();

  return { success: true, message: 'Candidate deleted.' };
}

export async function convertDiscoveryCandidateAction(candidateId: string): Promise<{ success: boolean; message: string; innovationId?: string }> {
  const pageData = await getInnovationDashboardPageData();
  const candidate = pageData.discoveryCandidates.find((item) => item.id === candidateId);

  if (!candidate) {
    return { success: false, message: 'Candidate not found.' };
  }

  const innovation = await convertDiscoveryCandidateToInnovation(candidate);
  revalidateInnovationPages(`/innovation/discovery/${candidateId}`);
  return { success: true, message: 'Candidate promoted to innovation.', innovationId: innovation.id };
}

export async function addInnovationStepAction(
  innovationId: string,
  title: string,
  description?: string
): Promise<{ success: boolean; message: string }> {
  const stepTitle = title.trim();

  if (!stepTitle) {
    return { success: false, message: 'Step title is required.' };
  }

  await addInnovationProcessStep({
    innovation_id: innovationId,
    title: stepTitle,
    description: description?.trim() || undefined
  });

  revalidateInnovationPages(`/innovation/${innovationId}`);
  return { success: true, message: 'Step added.' };
}

export async function markInnovationNextStepDoneAction(innovationId: string): Promise<{ success: boolean; message: string }> {
  const nextStep = await markInnovationNextStepDone(innovationId);

  if (!nextStep) {
    return { success: false, message: 'No pending step found.' };
  }

  revalidateInnovationPages(`/innovation/${innovationId}`);

  return { success: true, message: 'Step marked done.' };
}

export async function blockInnovationAction(innovationId: string, blockedReason: string): Promise<{ success: boolean; message: string }> {
  const reason = blockedReason.trim();

  if (!reason) {
    return { success: false, message: 'Blocked reason is required.' };
  }

  await blockInnovation(innovationId, reason);
  revalidateInnovationPages(`/innovation/${innovationId}`);
  return { success: true, message: 'Innovation blocked.' };
}

export async function resumeInnovationAction(innovationId: string): Promise<{ success: boolean; message: string }> {
  await resumeInnovation(innovationId);
  revalidateInnovationPages(`/innovation/${innovationId}`);
  return { success: true, message: 'Innovation resumed.' };
}

export async function updateInnovationBlockedReasonAction(
  innovationId: string,
  blockedReason: string
): Promise<{ success: boolean; message: string }> {
  const reason = blockedReason.trim();

  if (!reason) {
    return { success: false, message: 'Blocked reason is required.' };
  }

  await updateInnovationBlockedReason(innovationId, reason);
  revalidateInnovationPages(`/innovation/${innovationId}`);
  return { success: true, message: 'Blocked reason updated.' };
}
