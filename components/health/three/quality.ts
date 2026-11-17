import type { QualityTier } from './three.types';
export function chooseQuality(input: { enabled: boolean; reducedMotion: boolean; webgl: boolean; memory?: number; cores?: number; compact: boolean; saveData?: boolean }): QualityTier {
  if (!input.enabled || input.reducedMotion || !input.webgl || input.saveData || (input.memory !== undefined && input.memory <= 2) || (input.cores !== undefined && input.cores <= 2)) return 'fallback';
  if (input.compact || (input.memory !== undefined && input.memory <= 4) || (input.cores !== undefined && input.cores <= 4)) return 'reduced';
  return 'full';
}
