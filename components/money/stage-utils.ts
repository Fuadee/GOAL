import { HouseStage, StageConfig, houseStages } from './types';

export const stageConfig: Record<HouseStage, StageConfig> = {
  planning: {
    label: 'Loan Planning',
    description: 'Prepare strategy, debt profile, and funding plan.',
    badgeClass: 'border-[#DDE3D5] bg-[#EEF1EA] text-[#334155]'
  },
  loan_applied: {
    label: 'Loan Applied',
    description: 'Loan application submitted and waiting for review.',
    badgeClass: 'border-[#DDE3D5] bg-[#EEF1EA] text-[#334155]'
  },
  loan_approved: {
    label: 'Loan Approved',
    description: 'Loan approved and ready to execute next steps.',
    badgeClass: 'border-[#DDE3D5] bg-[#EEF1EA] text-[#334155]'
  },
  preparing_land: {
    label: 'Land / Preparation',
    description: 'Land prep, permits, and utilities are in progress.',
    badgeClass: 'border-[#DDE3D5] bg-[#EEF1EA] text-[#334155]'
  },
  under_construction: {
    label: 'Construction',
    description: 'Building structure and interior are under construction.',
    badgeClass: 'border-[#DDE3D5] bg-[#EEF1EA] text-[#334155]'
  },
  ready_to_rent: {
    label: 'Ready to Rent',
    description: 'House is completed and listed for tenants.',
    badgeClass: 'border-[#DDE3D5] bg-[#EEF1EA] text-[#334155]'
  },
  rented: {
    label: 'Rented',
    description: 'A tenant is active and rental income is flowing.',
    badgeClass: 'border-[#DDE3D5] bg-[#EEF1EA] text-[#334155]'
  },
  stable_cashflow: {
    label: 'Cash Flow Stable',
    description: 'Debt service is healthy and cash flow is stable.',
    badgeClass: 'border-[#DDE3D5] bg-[#EEF1EA] text-[#334155]'
  }
};

export const getStageIndex = (stage: HouseStage) => houseStages.indexOf(stage);

export const getStageProgressPercent = (stage: HouseStage) => {
  const stageIndex = getStageIndex(stage);

  return ((stageIndex + 1) / houseStages.length) * 100;
};
