import { HouseStage, StageConfig, houseStages } from './types';

export const stageConfig: Record<HouseStage, StageConfig> = {
  planning: {
    label: 'Loan Planning',
    description: 'Prepare strategy, debt profile, and funding plan.',
    badgeClass: 'border-fuchsia-400/30 bg-fuchsia-400/15 text-fuchsia-200'
  },
  loan_applied: {
    label: 'Loan Applied',
    description: 'Loan application submitted and waiting for review.',
    badgeClass: 'border-violet-400/30 bg-violet-400/15 text-violet-200'
  },
  loan_approved: {
    label: 'Loan Approved',
    description: 'Loan approved and ready to execute next steps.',
    badgeClass: 'border-sky-400/30 bg-sky-400/15 text-sky-200'
  },
  preparing_land: {
    label: 'Land / Preparation',
    description: 'Land prep, permits, and utilities are in progress.',
    badgeClass: 'border-cyan-400/30 bg-cyan-400/15 text-cyan-200'
  },
  under_construction: {
    label: 'Construction',
    description: 'Building structure and interior are under construction.',
    badgeClass: 'border-amber-400/30 bg-amber-400/15 text-amber-200'
  },
  ready_to_rent: {
    label: 'Ready to Rent',
    description: 'House is completed and listed for tenants.',
    badgeClass: 'border-emerald-400/30 bg-emerald-400/15 text-emerald-200'
  },
  rented: {
    label: 'Rented',
    description: 'A tenant is active and rental income is flowing.',
    badgeClass: 'border-green-400/30 bg-green-400/15 text-green-200'
  },
  stable_cashflow: {
    label: 'Cash Flow Stable',
    description: 'Debt service is healthy and cash flow is stable.',
    badgeClass: 'border-lime-400/30 bg-lime-400/15 text-lime-200'
  }
};

export const getStageIndex = (stage: HouseStage) => houseStages.indexOf(stage);

export const getStageProgressPercent = (stage: HouseStage) => {
  const stageIndex = getStageIndex(stage);

  return ((stageIndex + 1) / houseStages.length) * 100;
};
