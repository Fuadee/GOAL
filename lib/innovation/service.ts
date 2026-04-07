import {
  createInnovation,
  createInnovationLog,
  createInnovationProcessStep,
  touchInnovationUpdatedAt,
  updateInnovationProcessStep
} from '@/lib/innovation/mutations';
import {
  getInnovationById,
  getInnovationDashboardRows,
  getInnovationLogsByInnovationId,
  getInnovationProcessStepsByInnovationId
} from '@/lib/innovation/queries';
import {
  CreateInnovationLogPayload,
  CreateInnovationPayload,
  CreateInnovationProcessStepPayload,
  InnovationCardViewModel,
  InnovationDetailViewModel,
  InnovationProcessStepRow,
  UpdateInnovationProcessStepPayload
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

export async function getInnovationDashboardData(): Promise<InnovationCardViewModel[]> {
  const rows = await getInnovationDashboardRows();

  return rows.map((row) => {
    const { completedStepCount, stepTotal, progressPercent } = calculateProgress(row.innovation_process_steps);
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      goal: row.goal,
      status: row.status,
      created_at: row.created_at,
      updated_at: row.updated_at,
      completedStepCount,
      stepTotal,
      progressPercent
    };
  });
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

export async function addInnovationProcessStep(payload: CreateInnovationProcessStepPayload) {
  const created = await createInnovationProcessStep(payload);
  await touchInnovationUpdatedAt(payload.innovation_id);
  return created;
}

export async function updateInnovationStepStatus(stepId: string, innovationId: string, payload: UpdateInnovationProcessStepPayload) {
  const updated = await updateInnovationProcessStep(stepId, payload);
  await touchInnovationUpdatedAt(innovationId);
  return updated;
}

export async function addInnovationLog(payload: CreateInnovationLogPayload) {
  const created = await createInnovationLog(payload);
  await touchInnovationUpdatedAt(payload.innovation_id);
  return created;
}
