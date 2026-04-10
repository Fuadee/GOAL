import {
  createDiscoveryCandidate,
  createInnovation,
  createInnovationLog,
  createInnovationProcessStep,
  deleteDiscoveryCandidate,
  touchInnovationUpdatedAt,
  updateDiscoveryCandidate,
  updateInnovation,
  updateInnovationProcessStep
} from '@/lib/innovation/mutations';
import {
  getDiscoveryCandidates,
  getInnovationById,
  getInnovationDashboardRows,
  getInnovationLogsByInnovationId,
  getInnovationProcessStepsByInnovationId
} from '@/lib/innovation/queries';
import {
  deriveDiscoveryCandidateState,
  deriveInnovationState,
  getCurrentInnovation,
  getDiscoveryGap,
  getNextDiscoveryAction,
  getNextStep,
  sortDiscoveryCandidatesByPipeline
} from '@/lib/innovation/helpers';
import {
  CreateDiscoveryCandidatePayload,
  CreateInnovationLogPayload,
  CreateInnovationPayload,
  CreateInnovationProcessStepPayload,
  DiscoveryCandidateRow,
  InnovationCardViewModel,
  InnovationDetailViewModel,
  InnovationProcessStepRow,
  UpdateInnovationProcessStepPayload,
  InnovationStatus
} from '@/lib/innovation/types';

function calculateProgress(steps: Pick<InnovationProcessStepRow, 'status'>[]): { completedStepCount: number; stepTotal: number; progressPercent: number } {
  const stepTotal = steps.length;
  const completedStepCount = steps.filter((step) => step.status === 'done').length;

  if (stepTotal === 0) {
    return { completedStepCount, stepTotal, progressPercent: 0 };
  }

  return {
    completedStepCount,
    stepTotal,
    progressPercent: Math.round((completedStepCount / stepTotal) * 100)
  };
}

function mapDerivedStateToStatus(state: ReturnType<typeof deriveInnovationState>): InnovationStatus {
  if (state === 'building') {
    return 'building';
  }

  return state;
}

export async function getInnovationDashboardData(): Promise<InnovationCardViewModel[]> {
  const rows = await getInnovationDashboardRows();

  return rows.map((row) => {
    const { completedStepCount, stepTotal, progressPercent } = calculateProgress(row.innovation_process_steps);
    const innovation: InnovationCardViewModel = {
      id: row.id,
      title: row.title,
      description: row.description,
      goal: row.goal,
      status: row.status,
      is_blocked: row.is_blocked,
      blocked_reason: row.blocked_reason,
      blocked_at: row.blocked_at,
      created_at: row.created_at,
      updated_at: row.updated_at,
      completedStepCount,
      stepTotal,
      progressPercent,
      steps: row.innovation_process_steps,
      nextStep: null
    };

    innovation.nextStep = getNextStep(innovation);
    return innovation;
  });
}

export async function getInnovationDashboardPageData(goal = 10): Promise<{
  innovations: InnovationCardViewModel[];
  currentMission: InnovationCardViewModel | null;
  discoveryCandidates: DiscoveryCandidateRow[];
  discoveryGap: number;
  nextDiscoveryAction: string;
}> {
  const [innovations, discoveryCandidates] = await Promise.all([getInnovationDashboardData(), getDiscoveryCandidates()]);

  return {
    innovations,
    currentMission: getCurrentInnovation(innovations),
    discoveryCandidates: discoveryCandidates.sort((a, b) => sortDiscoveryCandidatesByPipeline(a) - sortDiscoveryCandidatesByPipeline(b)),
    discoveryGap: getDiscoveryGap(innovations, goal),
    nextDiscoveryAction: getNextDiscoveryAction(getDiscoveryGap(innovations, goal))
  };
}

export async function getInnovationDetailData(id: string): Promise<InnovationDetailViewModel | null> {
  const innovation = await getInnovationById(id);

  if (!innovation) {
    return null;
  }

  const [steps, logs] = await Promise.all([
    getInnovationProcessStepsByInnovationId(id),
    getInnovationLogsByInnovationId(id)
  ]);

  const { completedStepCount, progressPercent } = calculateProgress(steps);

  return {
    innovation,
    steps,
    logs,
    completedStepCount,
    progressPercent
  };
}

export async function addInnovation(payload: CreateInnovationPayload) {
  return createInnovation(payload);
}

export async function addDiscoveryCandidate(payload: CreateDiscoveryCandidatePayload) {
  return createDiscoveryCandidate(payload);
}

export async function defineCandidateProblem(candidateId: string, problem: string) {
  return updateDiscoveryCandidate(candidateId, { problem });
}

export async function updateCandidateProblem(candidateId: string, problem: string) {
  return updateDiscoveryCandidate(candidateId, { problem });
}

export async function addCandidateConcept(candidateId: string, concept: string) {
  return updateDiscoveryCandidate(candidateId, { concept });
}

export async function updateCandidateConcept(candidateId: string, concept: string) {
  return updateDiscoveryCandidate(candidateId, { concept });
}

export async function markCandidateValidated(candidateId: string, validationNotes?: string) {
  return updateDiscoveryCandidate(candidateId, {
    validated_at: new Date().toISOString(),
    validation_notes: validationNotes || null
  });
}

export async function removeDiscoveryCandidate(candidateId: string) {
  await deleteDiscoveryCandidate(candidateId);
}

export async function convertDiscoveryCandidateToInnovation(candidate: DiscoveryCandidateRow) {
  const innovation = await createInnovation({
    title: candidate.title,
    description: candidate.concept ?? candidate.problem ?? undefined,
    goal: candidate.notes ?? undefined
  });

  await updateDiscoveryCandidate(candidate.id, {
    converted_at: new Date().toISOString(),
    converted_innovation_id: innovation.id
  });

  return innovation;
}

export async function addInnovationProcessStep(payload: CreateInnovationProcessStepPayload) {
  const created = await createInnovationProcessStep(payload);
  await syncInnovationStatus(payload.innovation_id);
  return created;
}

export async function updateInnovationStepStatus(stepId: string, innovationId: string, payload: UpdateInnovationProcessStepPayload) {
  const updated = await updateInnovationProcessStep(stepId, payload);
  await syncInnovationStatus(innovationId);
  return updated;
}

export async function addInnovationLog(payload: CreateInnovationLogPayload) {
  const created = await createInnovationLog(payload);
  await touchInnovationUpdatedAt(payload.innovation_id);
  return created;
}

export async function markInnovationNextStepDone(innovationId: string) {
  const steps = await getInnovationProcessStepsByInnovationId(innovationId);
  const nextStep = steps.find((step) => step.status !== 'done');

  if (!nextStep) {
    return null;
  }

  await updateInnovationProcessStep(nextStep.id, {
    status: 'done',
    completed_at: new Date().toISOString()
  });

  await syncInnovationStatus(innovationId);
  return nextStep;
}

export async function blockInnovation(innovationId: string, blockedReason: string) {
  return updateInnovation(innovationId, {
    is_blocked: true,
    blocked_reason: blockedReason,
    blocked_at: new Date().toISOString(),
    status: 'blocked'
  });
}

export async function resumeInnovation(innovationId: string) {
  await updateInnovation(innovationId, {
    is_blocked: false,
    blocked_at: null,
    status: 'building'
  });

  await syncInnovationStatus(innovationId);
}

export async function updateInnovationBlockedReason(innovationId: string, blockedReason: string) {
  return updateInnovation(innovationId, {
    blocked_reason: blockedReason,
    blocked_at: new Date().toISOString()
  });
}

async function syncInnovationStatus(innovationId: string) {
  const innovations = await getInnovationDashboardData();
  const innovation = innovations.find((item) => item.id === innovationId);

  if (!innovation) {
    return;
  }

  const derivedState = deriveInnovationState(innovation);

  await updateInnovation(innovationId, {
    status: mapDerivedStateToStatus(derivedState),
    blocked_at: innovation.is_blocked ? innovation.blocked_at ?? new Date().toISOString() : null
  });

  await touchInnovationUpdatedAt(innovationId);
}

export { deriveDiscoveryCandidateState };
