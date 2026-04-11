import { SmvActionType } from '@/lib/smv/types';
import { confidenceStageConfig } from '@/lib/smv/progression-config';

export const CONFIDENCE_LEVELS = confidenceStageConfig;

export const MOCK_CONFIDENCE_LOGS: Array<{ action_type: SmvActionType }> = [
  ...Array.from({ length: 6 }, () => ({ action_type: 'confidence_rep' as const })),
  ...Array.from({ length: 4 }, () => ({ action_type: 'leadership_rep' as const }))
];
