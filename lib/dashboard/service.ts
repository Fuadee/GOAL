import { getSmvProjects } from '@/lib/smv/projects';
import { getSmvProjectProgress } from '@/lib/smv/project-progress';
import { getConstructionInvestmentProjects } from '@/lib/money/queries';
import { getFinancialGoalProgress } from '@/lib/money/construction-progress';
import { getRunnerDashboardData } from '@/lib/running/quest.server';
import { getRunningGoalProgress } from '@/lib/running/progress';
import { getHealthTodayMissionSummary } from '@/lib/running/quest';
import { getInnovationDashboardPageData } from '@/lib/innovation/service';
import { getInnovationGoalProgress, TARGET_INNOVATIONS } from '@/lib/innovation/progress';
import { getBloodDonationDashboardData } from '@/lib/blood-donation/service';
import { getBloodDonationPageProgress } from '@/lib/blood-donation/progress';
import { getCurrentBloodDonationPlan, getNextBloodDonationMissionSummary } from '@/lib/blood-donation/plan-display';
import type { ModuleId, ModuleProgress } from './progress';

const moduleInfo: ModuleProgress[] = [
  { id: 'smv', title: 'ภารกิจชีวิต', href: '/smv', percentage: null, precision: 0, metric: 'Milestones ที่สำเร็จ', detail: 'ยังไม่มี Milestone' },
  { id: 'money', title: 'การเงิน', href: '/money-management', percentage: null, precision: 1, metric: 'สัดส่วนงบก่อสร้างที่ใช้', detail: 'ยังไม่มีโครงการบ้านเช่าที่มีงบประมาณ' },
  { id: 'health', title: 'สุขภาพ', href: '/health', percentage: null, precision: 1, metric: 'ระยะวิ่งสูงสุด / เป้าหมาย', detail: 'ยังไม่มีผลการวิ่งที่บันทึกไว้' },
  { id: 'innovation', title: 'นวัตกรรม', href: '/innovation', percentage: null, precision: 0, metric: 'แอปที่สร้างสำเร็จ', detail: '' },
  { id: 'world', title: 'เพื่อสังคม', href: '/heal-the-world', percentage: null, precision: 0, metric: 'ภารกิจบริจาคเลือด', detail: 'ยังไม่มีเป้าหมายการบริจาคเลือด' }
];

async function loadSmv(): Promise<Partial<ModuleProgress>> {
  const projects = await getSmvProjects();
  const progress = getSmvProjectProgress(projects);
  const nextProject = projects.find((project) => project.smv_project_milestones?.some((milestone) => !milestone.is_completed));
  const remaining = nextProject?.smv_project_milestones?.filter((milestone) => !milestone.is_completed).length;
  return {
    ...progress, percentage: progress.total ? progress.percentage : null, unit: 'Milestones',
    detail: progress.total ? `สำเร็จแล้ว ${progress.completed} จาก ${progress.total} Milestones` : 'ยังไม่มี Milestone',
    nextAction: nextProject ? { title: nextProject.title, detail: `เหลือ ${remaining} Milestones`, href: `/smv/${nextProject.id}` } : undefined
  };
}

async function loadMoney(): Promise<Partial<ModuleProgress>> {
  // Read the same repository as the money page, without its error-to-zero fallback.
  const data = await getConstructionInvestmentProjects();
  const { targetProject, summary, progress, checklist } = getFinancialGoalProgress(data);
  const next = checklist.find((item) => !item.done);
  const measured = !!summary && summary.totalBudget > 0;
  return {
    percentage: measured ? progress : null,
    completed: measured ? summary.totalSpent : undefined, total: measured ? summary.totalBudget : undefined, unit: 'บาท',
    detail: measured ? 'คำนวณจากยอดจ่ายจริงเทียบงบ ไม่ใช่จำนวนงานที่เสร็จ' : 'ยังไม่มีโครงการบ้านเช่าที่มีงบประมาณ',
    nextAction: next && targetProject ? { title: next.title, detail: targetProject.name, href: `/money-management/projects/${targetProject.id}` } : undefined
  };
}

async function loadHealth(): Promise<Partial<ModuleProgress>> {
  const data = await getRunnerDashboardData();
  const progress = getRunningGoalProgress(data);
  const mission = getHealthTodayMissionSummary(data.todayStatus, data.currentLevel, data.currentLevel?.latestAttempt ?? null);
  return {
    percentage: data.logs.length ? progress.progress : null,
    completed: data.logs.length ? progress.bestDistanceKm : undefined, total: progress.targetDistanceKm, unit: 'กม.',
    detail: data.logs.length ? 'ใช้ระยะทางสูงสุดจากบันทึกการวิ่ง' : 'ยังไม่มีผลการวิ่งที่บันทึกไว้',
    nextAction: data.currentLevel && data.todayStatus === 'not_run' ? { title: mission.primaryText, detail: mission.secondaryText, href: '/health' } : undefined
  };
}

async function loadInnovation(): Promise<Partial<ModuleProgress>> {
  const data = await getInnovationDashboardPageData(TARGET_INNOVATIONS);
  const progress = getInnovationGoalProgress(data.innovations);
  return {
    ...progress, unit: 'แอป', detail: `สร้างสำเร็จ ${progress.completed} จาก ${progress.total} แอป`,
    nextAction: data.nextAction.source !== 'discovery_mode' ? {
      title: data.nextAction.label, href: data.nextAction.href, detail: data.currentMission?.title
    } : undefined
  };
}

async function loadWorld(): Promise<Partial<ModuleProgress>> {
  const data = await getBloodDonationDashboardData();
  if (!data.goal) return {};
  const progress = getBloodDonationPageProgress(data.events);
  const plan = getCurrentBloodDonationPlan(data.upcomingPlans);
  const mission = getNextBloodDonationMissionSummary(plan);
  return {
    ...progress, unit: 'ครั้ง', detail: `สำเร็จแล้ว ${progress.completed} จาก ${progress.total} ครั้ง`,
    nextAction: plan ? { title: mission.primaryText, detail: mission.secondaryText, href: '/heal-the-world', dueDate: plan.planned_date ?? undefined } : undefined
  };
}

export async function getLifeDashboardData(): Promise<ModuleProgress[]> {
  const loaders: Record<ModuleId, () => Promise<Partial<ModuleProgress>>> = { smv: loadSmv, money: loadMoney, health: loadHealth, innovation: loadInnovation, world: loadWorld };
  return Promise.all(moduleInfo.map(async (module) => {
    try {
      return { ...module, ...await loaders[module.id]() };
    } catch {
      // One unavailable module must not hide the others or become a false 0%.
      return { ...module, unavailable: true, detail: 'โหลดข้อมูลไม่สำเร็จ กรุณาลองรีเฟรชอีกครั้ง' };
    }
  }));
}
