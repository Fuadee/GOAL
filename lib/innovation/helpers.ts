import {
  DiscoveryCandidateRow,
  DiscoveryCandidateState,
  DiscoveryCandidateStateAction,
  DiscoveryCandidateStateMeta,
  InnovationCardViewModel,
  InnovationDerivedState,
  InnovationProcessStepSummary,
  InnovationStateAction,
  InnovationStateMeta,
  InnovationNextAction
} from '@/lib/innovation/types';

const CURRENT_MISSION_STATUS_PRIORITY: InnovationDerivedState[] = ['building', 'idea', 'blocked', 'completed'];

function compareSteps(a: InnovationProcessStepSummary, b: InnovationProcessStepSummary): number {
  const orderA = a.step_order ?? Number.MAX_SAFE_INTEGER;
  const orderB = b.step_order ?? Number.MAX_SAFE_INTEGER;

  if (orderA !== orderB) {
    return orderA - orderB;
  }

  return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
}

export function getNextStep(innovation: InnovationCardViewModel): InnovationProcessStepSummary | null {
  return innovation.steps.filter((step) => step.status !== 'completed').sort(compareSteps)[0] ?? null;
}

export function deriveDiscoveryCandidateState(candidate: DiscoveryCandidateRow): DiscoveryCandidateState {
  if (candidate.converted_at || candidate.converted_innovation_id) {
    return 'converted';
  }

  if (candidate.validated_at) {
    return 'validated';
  }

  if (candidate.concept) {
    return 'concept';
  }

  if (candidate.problem) {
    return 'pain_point';
  }

  return 'observed';
}

const DISCOVERY_STATE_META: Record<
  DiscoveryCandidateState,
  { label: string; description: string; allowedActions: DiscoveryCandidateStateAction[] }
> = {
  observed: {
    label: 'OBSERVED',
    description: 'ยังไม่ได้ระบุปัญหาให้ชัดเจน',
    allowedActions: ['define_problem', 'edit_basic_info']
  },
  pain_point: {
    label: 'PAIN POINT',
    description: 'ระบุปัญหาแล้ว แต่ยังไม่มีแนวคิดทางแก้',
    allowedActions: ['add_concept', 'edit_problem']
  },
  concept: {
    label: 'CONCEPT',
    description: 'มีแนวคิดแล้ว รอการยืนยันก่อนลงมือทำ',
    allowedActions: ['mark_validated', 'edit_concept']
  },
  validated: {
    label: 'VALIDATED',
    description: 'แนวคิดนี้พร้อมแปลงเป็น innovation',
    allowedActions: ['convert_to_innovation', 'edit_validation_notes']
  },
  converted: {
    label: 'CONVERTED',
    description: 'แปลงเป็น innovation เรียบร้อยแล้ว',
    allowedActions: ['open_innovation', 'view_linked_innovation_info']
  }
};

export function getDiscoveryCandidateStateMeta(candidate: DiscoveryCandidateRow): DiscoveryCandidateStateMeta {
  const state = deriveDiscoveryCandidateState(candidate);
  const meta = DISCOVERY_STATE_META[state];

  return {
    state,
    label: meta.label,
    description: meta.description,
    allowedActions: meta.allowedActions
  };
}

const PRIMARY_DISCOVERY_ACTION_LABEL: Record<DiscoveryCandidateState, string> = {
  observed: 'Define Problem',
  pain_point: 'Add Concept',
  concept: 'Mark Validated',
  validated: 'Convert to Innovation',
  converted: 'Open Innovation'
};

export function getPrimaryDiscoveryActionLabel(candidate: DiscoveryCandidateRow): string {
  return PRIMARY_DISCOVERY_ACTION_LABEL[deriveDiscoveryCandidateState(candidate)];
}

export function deriveInnovationState(innovation: InnovationCardViewModel): InnovationDerivedState {
  if (innovation.is_blocked) {
    return 'blocked';
  }

  if (innovation.stepTotal === 0) {
    return 'idea';
  }

  if (innovation.stepTotal > 0 && innovation.completedStepCount < innovation.stepTotal) {
    return 'building';
  }

  return 'completed';
}

const INNOVATION_STATE_META: Record<InnovationDerivedState, { label: string; description: string; allowedActions: InnovationStateAction[] }> = {
  idea: {
    label: 'IDEA',
    description: 'ยังไม่ได้เริ่มลงมือ',
    allowedActions: ['add_first_step', 'edit_innovation', 'block', 'open_details']
  },
  building: {
    label: 'BUILDING',
    description: 'กำลังพัฒนา',
    allowedActions: ['mark_next_step_done', 'add_step', 'open_details', 'block']
  },
  blocked: {
    label: 'BLOCKED',
    description: 'ติดปัญหาที่ต้องแก้ก่อน',
    allowedActions: ['resume', 'edit_block_reason', 'open_details']
  },
  completed: {
    label: 'COMPLETED',
    description: 'เสร็จครบทุกขั้นแล้ว',
    allowedActions: ['open_details', 'create_follow_up']
  }
};

export function getInnovationStateMeta(innovation: InnovationCardViewModel): InnovationStateMeta {
  const state = deriveInnovationState(innovation);
  const meta = INNOVATION_STATE_META[state];

  return {
    state,
    label: meta.label,
    description: meta.description,
    allowedActions: meta.allowedActions
  };
}

export function getCurrentInnovation(innovations: InnovationCardViewModel[]): InnovationCardViewModel | null {
  return (
    innovations
      .filter((innovation) => deriveInnovationState(innovation) !== 'completed')
      .sort((a, b) => {
        const aState = deriveInnovationState(a);
        const bState = deriveInnovationState(b);

        if (aState !== bState) {
          return CURRENT_MISSION_STATUS_PRIORITY.indexOf(aState) - CURRENT_MISSION_STATUS_PRIORITY.indexOf(bState);
        }

        if (b.progressPercent !== a.progressPercent) {
          return b.progressPercent - a.progressPercent;
        }

        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      })[0] ?? null
  );
}

export function getActiveMission(innovations: InnovationCardViewModel[]): InnovationCardViewModel | null {
  return getCurrentInnovation(innovations);
}


export function getCurrentStep(mission: InnovationCardViewModel | null): InnovationProcessStepSummary | null {
  if (!mission) return null;
  return mission.steps.find((step) => step.status === 'in_progress') ?? null;
}

export function getNextTodoStep(mission: InnovationCardViewModel | null): InnovationProcessStepSummary | null {
  if (!mission) return null;
  return mission.steps.filter((step) => step.status === 'todo').sort(compareSteps)[0] ?? null;
}

export function getUpcomingSteps(mission: InnovationCardViewModel | null): InnovationProcessStepSummary[] {
  if (!mission) return [];
  const current = getCurrentStep(mission);
  return mission.steps
    .filter((step) => step.status === 'todo' && step.id !== current?.id)
    .sort(compareSteps);
}

export function getCompletedSteps(mission: InnovationCardViewModel | null): InnovationProcessStepSummary[] {
  if (!mission) return [];
  return mission.steps.filter((step) => step.status === 'completed').sort(compareSteps);
}

export function getCurrentMissionFocus(mission: InnovationCardViewModel | null): InnovationProcessStepSummary | null {
  if (!mission) return null;

  const inProgress = mission.steps.filter((step) => step.status === 'in_progress').sort(compareSteps)[0];
  if (inProgress) return inProgress;

  const waiting = mission.steps.filter((step) => step.status === 'waiting').sort(compareSteps)[0];
  if (waiting) return waiting;

  return null;
}

export function getCurrentFocusStep(mission: InnovationCardViewModel | null): InnovationProcessStepSummary | null {
  return getCurrentMissionFocus(mission);
}

export function getStepStatusSummary(mission: InnovationCardViewModel | null): {active:number; blocked:number; waiting:number; done:number; total:number} {
  if (!mission) return { active: 0, blocked: 0, waiting: 0, done: 0, total: 0 };
  return {
    active: mission.steps.filter((step) => step.status === 'in_progress').length,
    blocked: mission.steps.filter((step) => step.status === 'blocked').length,
    waiting: mission.steps.filter((step) => step.status === 'waiting').length,
    done: mission.steps.filter((step) => step.status === 'completed').length,
    total: mission.steps.length
  };
}

export function getMissionProgress(mission: InnovationCardViewModel | null): { progressPercent: number; completedStepCount: number; stepTotal: number } {
  if (!mission) return { progressPercent: 0, completedStepCount: 0, stepTotal: 0 };
  return {
    progressPercent: mission.progressPercent,
    completedStepCount: mission.completedStepCount,
    stepTotal: mission.stepTotal
  };
}

export function getCurrentIncompleteStep(mission: InnovationCardViewModel | null): InnovationProcessStepSummary | null {
  if (!mission) return null;
  return mission.steps.filter((step) => step.status !== 'completed').sort(compareSteps)[0] ?? null;
}

export function getDiscoveryGap(innovations: InnovationCardViewModel[], goal = 10): number {
  return Math.max(goal - innovations.length, 0);
}

export function getInnovationNextAction({
  activeInnovation,
  candidates
}: {
  activeInnovation: InnovationCardViewModel | null;
  candidates: DiscoveryCandidateRow[];
}): InnovationNextAction {
  if (activeInnovation) {
    const currentStep = activeInnovation.steps.find((step) => step.status === 'in_progress');
    if (currentStep) {
      return {
        label: currentStep.title,
        source: 'current_step',
        ctaLabel: 'Continue Mission',
        href: `/innovation/${activeInnovation.id}`
      };
    }

    const nextIncompleteStep = activeInnovation.steps.filter((step) => step.status !== 'completed').sort(compareSteps)[0] ?? null;
    if (nextIncompleteStep) {
      return {
        label: nextIncompleteStep.title,
        source: 'next_step',
        ctaLabel: 'Continue Mission',
        href: `/innovation/${activeInnovation.id}`
      };
    }

    if (activeInnovation.goal) {
      return {
        label: activeInnovation.goal,
        source: 'next_milestone',
        ctaLabel: 'Continue Mission',
        href: `/innovation/${activeInnovation.id}`
      };
    }
  }

  const nextCandidate = candidates.find((candidate) => !candidate.converted_at && !candidate.converted_innovation_id);
  if (nextCandidate) {
    return {
      label: `ประเมินไอเดีย: ${nextCandidate.title}`,
      source: 'candidate_queue',
      ctaLabel: 'Review Candidate',
      href: '#discovery-candidates'
    };
  }

  return {
    label: 'เพิ่ม candidate จากปัญหาจริงที่เจอวันนี้',
    source: 'discovery_mode',
    ctaLabel: '+ Add Candidate',
    href: '#discovery-candidates'
  };
}

const DISCOVERY_STATUS_ORDER: DiscoveryCandidateState[] = ['observed', 'pain_point', 'concept', 'validated', 'converted'];

export function sortDiscoveryCandidatesByPipeline(candidate: DiscoveryCandidateRow): number {
  return DISCOVERY_STATUS_ORDER.indexOf(deriveDiscoveryCandidateState(candidate));
}


export function getInnovationMissionSummary(mission: InnovationCardViewModel | null): { primaryText: string; secondaryText?: string } {
  if (!mission) {
    return {
      primaryText: 'No active mission right now. Add an innovation to start execution.'
    };
  }

  return {
    primaryText: mission.title,
    secondaryText: getCurrentMissionFocus(mission)?.title ?? 'ยังไม่มีขั้นตอน'
  };
}
