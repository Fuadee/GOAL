import { HouseStage } from './types';
import { stageConfig } from './stage-utils';

type PipelineBadgeProps = {
  stage: HouseStage;
};

export function PipelineBadge({ stage }: PipelineBadgeProps) {
  const config = stageConfig[stage];

  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${config.badgeClass}`}>
      {config.label}
    </span>
  );
}
