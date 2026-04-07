import { createInnovation, createInnovationLog, updateInnovation } from '@/lib/innovation/mutations';
import { getInnovationById, getInnovationLogsByInnovationId, getInnovationsWithLogCount } from '@/lib/innovation/queries';
import { CreateInnovationLogPayload, CreateInnovationPayload, InnovationCardViewModel, InnovationLogRow, InnovationRow, UpdateInnovationPayload } from '@/lib/innovation/types';

export async function getInnovationDashboardData(): Promise<InnovationCardViewModel[]> {
  const rows = await getInnovationsWithLogCount();
  return rows.map((row) => ({
    ...row,
    logCount: row.innovation_logs[0]?.count ?? 0
  }));
}

export async function getInnovationDetailData(id: string): Promise<{ innovation: InnovationRow | null; logs: InnovationLogRow[] }> {
  const innovation = await getInnovationById(id);

  if (!innovation) {
    return { innovation: null, logs: [] };
  }

  const logs = await getInnovationLogsByInnovationId(id);
  return { innovation, logs };
}

export async function addInnovation(payload: CreateInnovationPayload): Promise<InnovationRow> {
  return createInnovation(payload);
}

export async function addInnovationLog(payload: CreateInnovationLogPayload): Promise<InnovationLogRow> {
  return createInnovationLog(payload);
}

export async function updateInnovationProgressAndStatus(id: string, payload: UpdateInnovationPayload): Promise<InnovationRow> {
  return updateInnovation(id, payload);
}
