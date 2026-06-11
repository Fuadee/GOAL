import { getCurrentBloodDonationPlan, getNextBloodDonationMissionSummary } from '@/lib/blood-donation/plan-display';
import { BloodDonationDashboardViewModel } from '@/lib/blood-donation/types';
import { getInnovationMissionSummary } from '@/lib/innovation/helpers';
import { InnovationCardViewModel } from '@/lib/innovation/types';
import { ConstructionStepRow } from '@/lib/money/types';
import { getHealthTodayMissionSummary } from '@/lib/running/quest';
import { RunnerDashboardData } from '@/lib/running/quest.types';
import { getSmvOverviewData } from '@/lib/smv/service';
import { getCurrentConstructionStep, getWaitingSummary } from '@/components/money-planner/construction-helpers';

export type UnifiedMissionCardData = {
  key: 'smv' | 'money' | 'health' | 'innovation' | 'world';
  eyebrow: string;
  title: string;
  focusLabel: string;
  primaryText: string;
  secondaryText?: string;
  ctaLabel: string;
  href: string;
  tone?: 'critical' | 'warning' | 'info' | 'success';
};

export function getSmvUnifiedMissionCardData(smvOverview: Awaited<ReturnType<typeof getSmvOverviewData>>): UnifiedMissionCardData {
  const weakest = smvOverview.weakest[0];

  return {
    key: 'smv',
    eyebrow: 'ภารกิจชีวิต',
    title: 'สิ่งที่ต้องทำตอนนี้',
    focusLabel: 'คุณควรโฟกัส',
    primaryText: weakest?.dimension.label ?? 'ยังไม่มีมิติที่ต้องโฟกัสตอนนี้',
    ctaLabel: 'ไปหน้าภารกิจชีวิต',
    href: '/smv',
    tone: weakest ? 'critical' : 'info'
  };
}

export function getMoneyUnifiedMissionCardData(steps: ConstructionStepRow[]): UnifiedMissionCardData {
  const waitingSummary = getWaitingSummary(getCurrentConstructionStep(steps));

  return {
    key: 'money',
    eyebrow: 'การเงิน',
    title: 'สถานะที่ต้องรอตอนนี้',
    focusLabel: 'ตอนนี้ติดอยู่ที่',
    primaryText: waitingSummary.currentStep,
    secondaryText: `รอ: ${waitingSummary.waitingOn}`,
    ctaLabel: 'ไปหน้าการเงิน',
    href: '/money-management',
    tone: 'warning'
  };
}

export function getHealthUnifiedMissionCardData(data: RunnerDashboardData): UnifiedMissionCardData {
  const summary = getHealthTodayMissionSummary(data.todayStatus, data.currentLevel, data.currentLevel?.latestAttempt ?? null);

  return {
    key: 'health',
    eyebrow: 'สุขภาพ',
    title: 'ภารกิจวันนี้',
    focusLabel: 'วันนี้คุณต้องทำ',
    primaryText: summary.primaryText,
    secondaryText: summary.secondaryText,
    ctaLabel: summary.primaryActionLabel,
    href: '/health',
    tone: data.todayStatus === 'ran' ? 'success' : 'info'
  };
}

export function getInnovationUnifiedMissionCardData(mission: InnovationCardViewModel | null): UnifiedMissionCardData {
  const summary = getInnovationMissionSummary(mission);

  return {
    key: 'innovation',
    eyebrow: 'นวัตกรรม',
    title: 'ภารกิจหลักตอนนี้',
    focusLabel: 'โปรเจคที่ต้องเดินต่อ',
    primaryText: summary.primaryText,
    secondaryText: summary.secondaryText,
    ctaLabel: 'ไปหน้านวัตกรรม',
    href: '/innovation',
    tone: mission ? 'warning' : 'info'
  };
}

export function getWorldUnifiedMissionCardData(data: BloodDonationDashboardViewModel): UnifiedMissionCardData {
  const currentPlan = getCurrentBloodDonationPlan(data.upcomingPlans);
  const missionSummary = getNextBloodDonationMissionSummary(currentPlan);

  return {
    key: 'world',
    eyebrow: 'เพื่อสังคม',
    title: 'ภารกิจถัดไป',
    focusLabel: 'สิ่งที่ควรทำต่อ',
    primaryText: missionSummary.primaryText,
    secondaryText: missionSummary.secondaryText,
    ctaLabel: 'ไปหน้าเพื่อสังคม',
    href: '/heal-the-world',
    tone: currentPlan ? 'critical' : 'info'
  };
}
