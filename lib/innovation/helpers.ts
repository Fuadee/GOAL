import {
  DiscoveryCandidateRow,
  DiscoveryCandidateState,
  DiscoveryCandidateStateAction,
  DiscoveryCandidateStateMeta,
  InnovationCardViewModel,
  InnovationDerivedState,
  InnovationProcessStepSummary,
  InnovationStateAction,
  InnovationStateMeta
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
  return innovation.steps.filter((step) => step.status !== 'done').sort(compareSteps)[0] ?? null;
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

export function getDiscoveryGap(innovations: InnovationCardViewModel[], goal = 10): number {
  return Math.max(goal - innovations.length, 0);
}

export function getNextDiscoveryAction(gap: number): string {
  if (gap > 0) {
    return 'บันทึก pain point จากงานที่ทำซ้ำบ่อย';
  }

  return 'review และ improve innovation ที่มี';
}

const DISCOVERY_STATUS_ORDER: DiscoveryCandidateState[] = ['observed', 'pain_point', 'concept', 'validated', 'converted'];

export function sortDiscoveryCandidatesByPipeline(candidate: DiscoveryCandidateRow): number {
  return DISCOVERY_STATUS_ORDER.indexOf(deriveDiscoveryCandidateState(candidate));
}
