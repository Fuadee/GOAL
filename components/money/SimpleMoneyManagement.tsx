'use client';

import { FormEvent, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Clock3, PiggyBank, ShieldCheck, TrendingUp, type LucideIcon } from 'lucide-react';
import { CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { createConstructionExpenseAction, createConstructionProjectAction, deleteConstructionCategoryAction, deleteConstructionExpenseAction, deleteGrowthAssetAction, deleteMoneyIncomeSourceAction, saveAssetMonthlySnapshotAction, updateConstructionExpenseAction, upsertConstructionCategoryAction, upsertGrowthAssetAction, upsertMoneyIncomeSourceAction } from '@/app/money-management/actions';
import { AssetMonthlySnapshotRow, ConstructionCategoryRow, ConstructionCategoryStatus, ConstructionCostType, ConstructionExpenseRow, ConstructionInvestmentProjectsData, ConstructionOperationChecklistItem, ConstructionProjectBudgetData, ConstructionProjectRow, GrowthAssetRow, GrowthAssetType, MoneyManagementPageData, MoneyIncomeSourceRow, MoneySummary } from '@/lib/money/types';
import { FinancialAnalysisDialog } from '@/components/money/FinancialAnalysisDialog';

const thb = new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 });
const enMonthLabel = new Intl.DateTimeFormat('th-TH', { month: 'long', year: 'numeric' });
const shortMonthLabel = new Intl.DateTimeFormat('th-TH', { month: 'short' });
const categoryMeta = {
  investment: { label: 'การลงทุน', badge: 'การลงทุน', color: '#2563EB', badgeClass: 'bg-blue-100 text-blue-700', icon: TrendingUp },
  safe: { label: 'เงินสำรอง', badge: 'เงินสำรอง', color: '#0D9488', badgeClass: 'bg-teal-100 text-teal-700', icon: ShieldCheck },
  future: { label: 'เงินอนาคต', badge: 'เงินอนาคต', color: '#7C3AED', badgeClass: 'bg-violet-100 text-violet-700', icon: PiggyBank },
  receivable: { label: 'เงินรอรับ', badge: 'เงินรอรับ', color: '#D97706', badgeClass: 'bg-amber-100 text-amber-700', icon: Clock3 },
} as const;
type AssetCategory = keyof typeof categoryMeta;
const assetCategories = Object.keys(categoryMeta) as AssetCategory[];
const incomeBreakdownColors = ['#2563EB', '#0D9488', '#7C3AED', '#059669', '#E11D48', '#475569'];
type CategoryManageMode = 'create' | 'edit' | 'operation';
type ExpenseFilter = 'all' | ConstructionCostType;
type CategoryStatusFilter = 'all' | ConstructionCategoryStatus;
const constructionStatusOptions: ConstructionCategoryStatus[] = ['not_started', 'in_progress', 'completed'];
const constructionStatusLabel: Record<ConstructionCategoryStatus, string> = {
  not_started: 'ยังไม่เริ่ม',
  in_progress: 'กำลังทำ',
  completed: 'เสร็จแล้ว',
};
const projectStatusOptions = ['planning', 'active', 'completed', 'paused'] as const;
const projectStatusLabel: Record<(typeof projectStatusOptions)[number], string> = {
  planning: 'วางแผน',
  active: 'กำลังดำเนินการ',
  completed: 'เสร็จสิ้น',
  paused: 'พักโครงการ',
};

function CategoryStatusFilterButton({ value, label, count, active, onSelect }: { value: CategoryStatusFilter; label: string; count: number; active: boolean; onSelect: (value: CategoryStatusFilter) => void }) {
  return <button
    type="button"
    onClick={() => onSelect(value)}
    aria-pressed={active}
    className={`inline-flex min-w-0 items-center justify-center rounded-full border px-5 py-2.5 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 active:scale-[0.98] ${active
      ? 'border-blue-600 bg-blue-600 !text-white shadow-[0_10px_22px_-14px_rgba(37,99,235,0.9)] hover:border-blue-700 hover:bg-blue-700 [&_*]:!text-white'
      : 'border-slate-200 bg-white text-slate-700 shadow-sm hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700'
    }`}
  >
    <span className="break-words">{label} ({count})</span>
  </button>;
}

function financialColorClass(value: number) {
  if (value > 0) return 'text-emerald-600';
  if (value < 0) return 'text-rose-600';
  return 'text-slate-500';
}

function compactThb(value: number) {
  if (value >= 1_000_000) return `฿${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `฿${(value / 1_000).toFixed(1)}K`;
  return `฿${value.toFixed(0)}`;
}

function monthInputValue(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function parseSnapshotDate(value: string) {
  return new Date(`${value.slice(0, 10)}T00:00:00Z`);
}

function displaySnapshotMonth(value: string) {
  return enMonthLabel.format(parseSnapshotDate(value));
}

function chartMonth(value: string) {
  return shortMonthLabel.format(parseSnapshotDate(value));
}

function sortAssetSnapshotsByMonth(snapshots: AssetMonthlySnapshotRow[]) {
  return [...snapshots].sort((a, b) => a.snapshot_month.localeCompare(b.snapshot_month));
}

function getLatestAssetSnapshot(snapshots: AssetMonthlySnapshotRow[]) {
  return snapshots.reduce<AssetMonthlySnapshotRow | null>((latest, snapshot) => {
    if (!latest) return snapshot;
    return snapshot.snapshot_month > latest.snapshot_month ? snapshot : latest;
  }, null);
}

export function SimpleMoneyManagement({ data, goalImageUrl }: { data: MoneyManagementPageData; goalImageUrl: string | null }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [editing, setEditing] = useState<MoneyIncomeSourceRow | null>(null);
  const [open, setOpen] = useState(false);
  const [growthOpen, setGrowthOpen] = useState(false);
  const [growthEditing, setGrowthEditing] = useState<GrowthAssetRow | null>(null);
  const [snapshotOpen, setSnapshotOpen] = useState(false);
  const [snapshotMessage, setSnapshotMessage] = useState<string | null>(null);
  const [projectCreateOpen, setProjectCreateOpen] = useState(false);

  const rows = useMemo(() => data.incomeSources ?? [], [data.incomeSources]);
  const growthRows = useMemo(() => data.growthAssets ?? [], [data.growthAssets]);
  const snapshots = useMemo(() => data.assetSnapshots ?? [], [data.assetSnapshots]);
  const constructionProjects = data.constructionProjects;
  const onDelete = (id: string) => startTransition(async () => {
    const result = await deleteMoneyIncomeSourceAction(id);
    if (!result.success) return;
    setOpen(false);
    setEditing(null);
    router.refresh();
  });

  const openCreate = () => { setEditing(null); setOpen(true); };
  const openEdit = (row: MoneyIncomeSourceRow) => { setEditing(row); setOpen(true); };
  const saveSnapshot = async (formData: FormData) => {
    const result = await saveAssetMonthlySnapshotAction(formData);
    if (result.success) {
      setSnapshotOpen(false);
      setSnapshotMessage(result.message);
      router.refresh();
    }
    return result;
  };
  const latestSnapshot = getLatestAssetSnapshot(snapshots);

  useEffect(() => {
    if (!latestSnapshot) return;
    const summaryTotal = Number(data.growthSummary.totalValue ?? 0);
    const snapshotTotal = Number(latestSnapshot.total_value ?? 0);
    if (summaryTotal !== snapshotTotal) {
      console.warn('[Money Management] Summary total differs from latest asset snapshot total.', {
        latestSnapshotMonth: latestSnapshot.snapshot_month,
        summaryTotal,
        latestSnapshotTotal: snapshotTotal
      });
    }
  }, [data.growthSummary.totalValue, latestSnapshot]);


  return <div className="mx-auto w-full max-w-[1440px] space-y-8 px-8 pb-8 pt-7">
    <FinancialPrimaryGoalCard data={constructionProjects} imageUrl={goalImageUrl} />

    {snapshotMessage ? <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{snapshotMessage}</div> : null}

    <InvestmentProjectsSection
      data={constructionProjects}
      onCreate={() => setProjectCreateOpen(true)}
    />

    <div className="space-y-6 lg:space-y-7">
      <MonthlyIncomeCard rows={rows} summary={data.summary} onCreate={openCreate} onEdit={openEdit} onDelete={onDelete} />
      <GrowthAssetsCard rows={growthRows} totalValue={data.growthSummary.totalValue} totalProfitLoss={data.growthSummary.totalProfitLoss} onCreate={() => { setGrowthEditing(null); setGrowthOpen(true); }} onEdit={(row) => { setGrowthEditing(row); setGrowthOpen(true); }} onDelete={(id) => startTransition(async () => { const res = await deleteGrowthAssetAction(id); if (res.success) router.refresh(); })} />
    </div>

    <AssetGrowthTimeline rows={growthRows} snapshots={snapshots} onOpenSnapshot={() => setSnapshotOpen(true)} />

    {open ? <MoneyForm row={editing} onClose={() => setOpen(false)} onSubmit={(fd) => startTransition(async () => { const res = await upsertMoneyIncomeSourceAction(fd); if (res.success) { setOpen(false); router.refresh(); } })} /> : null}
    {growthOpen ? <GrowthAssetForm row={growthEditing} onClose={() => setGrowthOpen(false)} onSubmit={(fd) => startTransition(async () => { const res = await upsertGrowthAssetAction(fd); if (res.success) { setGrowthOpen(false); setGrowthEditing(null); router.refresh(); } })} /> : null}
    {snapshotOpen ? <AssetSnapshotForm assets={growthRows} snapshots={snapshots} onClose={() => setSnapshotOpen(false)} onSubmit={saveSnapshot} /> : null}
    {projectCreateOpen ? <ConstructionProjectForm
      onClose={() => setProjectCreateOpen(false)}
      onSubmit={async (fd) => {
        const result = await createConstructionProjectAction(fd);
        if (result.success) {
          setProjectCreateOpen(false);
          router.refresh();
        }
        return result;
      }}
    /> : null}
  </div>;
}

export function ProjectDetailClient({ budgetData }: { budgetData: ConstructionProjectBudgetData }) {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [actualExpenseOpen, setActualExpenseOpen] = useState<ConstructionCostType | null>(null);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [deleteExpenseId, setDeleteExpenseId] = useState<string | null>(null);
  const [categoryManageState, setCategoryManageState] = useState<{ mode: CategoryManageMode; categoryId?: string } | null>(null);
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);

  const refresh = () => router.refresh();
  return <>
    <ProjectBudgetDetail
      budgetData={budgetData}
      selectedCategory={selectedCategory}
      onSelectCategory={setSelectedCategory}
      onOpenExpenseForm={setActualExpenseOpen}
      onManageCategory={(mode, categoryId) => setCategoryManageState({ mode, categoryId })}
      onDeleteCategory={setDeleteCategoryId}
      onEditExpense={setEditingExpenseId}
      onDeleteExpense={setDeleteExpenseId}
    />
    {categoryManageState ? <CategoryManagementForm
      mode={categoryManageState.mode}
      project={budgetData.project}
      nextSortOrder={budgetData.categories.length ? Math.max(...budgetData.categories.map((category) => Number(category.sort_order ?? 0))) + 10 : 10}
      category={budgetData.categories.find((category) => category.id === categoryManageState.categoryId) ?? null}
      onClose={() => setCategoryManageState(null)}
      onSubmit={async (fd) => { const result = await upsertConstructionCategoryAction(fd); if (result.success) { setCategoryManageState(null); refresh(); } return result; }}
    /> : null}
    {deleteCategoryId ? <DeleteCategoryConfirm
      category={budgetData.categories.find((category) => category.id === deleteCategoryId) ?? null}
      expenseCount={budgetData.expenses.filter((expense) => expense.category_id === deleteCategoryId).length}
      onClose={() => setDeleteCategoryId(null)}
      onConfirm={async () => { const result = await deleteConstructionCategoryAction(deleteCategoryId); if (result.success) { setDeleteCategoryId(null); if (selectedCategory === deleteCategoryId) setSelectedCategory(null); refresh(); } return result; }}
    /> : null}
    {actualExpenseOpen ? <ActualExpenseForm project={budgetData.project} categories={budgetData.categories} expense={null} initialCostType={actualExpenseOpen} onClose={() => setActualExpenseOpen(null)} onSubmit={async (fd) => { const result = await createConstructionExpenseAction(fd); if (result.success) { setActualExpenseOpen(null); refresh(); } return result; }} /> : null}
    {editingExpenseId ? <ActualExpenseForm project={budgetData.project} categories={budgetData.categories} expense={budgetData.expenses.find((expense) => expense.id === editingExpenseId) ?? null} initialCostType={budgetData.expenses.find((expense) => expense.id === editingExpenseId)?.cost_type ?? 'material'} onClose={() => setEditingExpenseId(null)} onSubmit={async (fd) => { const result = await updateConstructionExpenseAction(fd); if (result.success) { setEditingExpenseId(null); refresh(); } return result; }} /> : null}
    {deleteExpenseId ? <DeleteExpenseConfirm expense={budgetData.expenses.find((expense) => expense.id === deleteExpenseId) ?? null} onClose={() => setDeleteExpenseId(null)} onConfirm={async () => { const result = await deleteConstructionExpenseAction(deleteExpenseId); if (result.success) { setDeleteExpenseId(null); refresh(); } return result; }} /> : null}
  </>;
}

function statusBadgeClass(status: ConstructionCategoryStatus | string) {
  if (status === 'completed' || status === 'done') return 'status-badge status-success';
  if (status === 'in_progress') return 'status-badge status-info';
  return 'status-badge status-waiting';
}

function getConstructionBudgetSummary(budgetData: ConstructionProjectBudgetData) {
  const materialBudgetTotal = budgetData.categories.reduce((sum, category) => sum + Number(category.budget ?? 0), 0);
  const laborBudgetTotal = budgetData.categories.reduce((sum, category) => sum + Number(category.labor_budget ?? 0), 0);
  const materialActualTotal = getExpensesTotalByType(budgetData.expenses, 'material');
  const laborActualTotal = getExpensesTotalByType(budgetData.expenses, 'labor');
  const grandBudgetTotal = materialBudgetTotal + laborBudgetTotal;
  const grandActualTotal = materialActualTotal + laborActualTotal;
  const grandRemainingTotal = grandBudgetTotal - grandActualTotal;
  const progressPercent = grandBudgetTotal > 0 ? Math.min((grandActualTotal / grandBudgetTotal) * 100, 999) : 0;
  return {
    materialBudgetTotal,
    materialActualTotal,
    laborBudgetTotal,
    laborActualTotal,
    grandBudgetTotal,
    grandActualTotal,
    grandRemainingTotal,
    progressPercent,
    totalBudget: grandBudgetTotal,
    totalSpent: grandActualTotal,
    remaining: grandRemainingTotal,
    financeProgress: progressPercent,
  };
}

function getProjectBudgetData(data: ConstructionInvestmentProjectsData, projectId: string | null): ConstructionProjectBudgetData {
  const project = data.projects.find((item) => item.id === projectId) ?? null;
  if (!project) return { project: null, categories: [], expenses: [] };
  return {
    project,
    categories: data.categories.filter((category) => category.project_id === project.id),
    expenses: data.expenses.filter((expense) => expense.project_id === project.id),
  };
}

function getInvestmentProjectsSummary(data: ConstructionInvestmentProjectsData) {
  const summary = getConstructionBudgetSummary({ project: null, categories: data.categories, expenses: data.expenses });
  return { projectCount: data.projects.length, totalBudget: summary.grandBudgetTotal, totalSpent: summary.grandActualTotal, remaining: summary.grandRemainingTotal, financeProgress: summary.progressPercent };
}

function formatPlainNumber(value: number) {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value);
}

function cleanMoneyInput(value: string) {
  return value.replace(/[^\d]/g, '');
}

function formatMoneyInput(value: string) {
  const cleanValue = cleanMoneyInput(value);
  if (!cleanValue) return '';
  return formatPlainNumber(Number(cleanValue));
}

function getExpenseCostType(expense: ConstructionExpenseRow): ConstructionCostType {
  return expense.cost_type === 'labor' ? 'labor' : 'material';
}

function getExpensesTotalByType(expenses: ConstructionExpenseRow[], costType: ConstructionCostType) {
  return expenses.filter((expense) => getExpenseCostType(expense) === costType).reduce((sum, expense) => sum + Number(expense.amount ?? 0), 0);
}

function getCategoryExpenses(expenses: ConstructionExpenseRow[], categoryId: string | null) {
  return expenses.filter((expense) => expense.category_id === categoryId);
}

function getCategoryBudgetSummary(category: ConstructionCategoryRow, expenses: ConstructionExpenseRow[]) {
  const materialBudget = Number(category.budget ?? 0);
  const laborBudget = Number(category.labor_budget ?? 0);
  const materialActual = getExpensesTotalByType(expenses, 'material');
  const laborActual = getExpensesTotalByType(expenses, 'labor');
  const materialRemaining = materialBudget - materialActual;
  const laborRemaining = laborBudget - laborActual;
  const grandBudget = materialBudget + laborBudget;
  const grandActual = materialActual + laborActual;
  const grandRemaining = grandBudget - grandActual;
  const percent = grandBudget > 0 ? Math.round((grandActual / grandBudget) * 100) : 0;
  return { materialBudget, materialActual, materialRemaining, laborBudget, laborActual, laborRemaining, grandBudget, grandActual, grandRemaining, percent };
}

function getCostTypeLabel(costType: ConstructionCostType) {
  return costType === 'labor' ? 'ค่าแรง' : 'ค่าวัสดุ';
}

function getOperationChecklist(category: ConstructionCategoryRow | null): ConstructionOperationChecklistItem[] {
  const checklist = category?.operation_checklist;
  if (!Array.isArray(checklist)) return [];
  return checklist
    .map((item) => ({ id: String(item.id || ''), title: String(item.title || '').trim(), done: Boolean(item.done) }))
    .filter((item) => item.title);
}

function getChecklistProgress(category: ConstructionCategoryRow) {
  const checklist = getOperationChecklist(category);
  const done = checklist.filter((item) => item.done).length;
  const total = checklist.length;
  const percent = total > 0 ? (done / total) * 100 : 0;
  return { done, total, percent };
}

function createChecklistId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `checklist-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function formatThaiDate(value: string) {
  return new Intl.DateTimeFormat('th-TH', { day: '2-digit', month: '2-digit', year: '2-digit' }).format(new Date(`${value}T00:00:00`));
}

function FinancialPrimaryGoalCard({ data, imageUrl }: { data: ConstructionInvestmentProjectsData; imageUrl: string | null }) {
  const normalizedTargetName = 'บ้านเช่า 6 ห้อง';
  const targetProject = data.projects.find((project) => project.name.trim() === normalizedTargetName)
    ?? data.projects.find((project) => project.name.includes('บ้านเช่า') && project.name.includes('6'))
    ?? data.projects.find((project) => project.name.includes('บ้านเช่า'))
    ?? null;
  const budgetData = targetProject ? getProjectBudgetData(data, targetProject.id) : null;
  const progress = budgetData ? getConstructionBudgetSummary(budgetData).financeProgress : 0;
  const checklist = budgetData?.categories.flatMap((category) => getOperationChecklist(category)) ?? [];
  const completedCount = checklist.filter((item) => item.done).length;

  return <article className="grid overflow-hidden rounded-[24px] border border-blue-200 bg-gradient-to-br from-white via-blue-50/40 to-sky-100/60 shadow-[0_22px_52px_-38px_rgba(37,99,235,0.55)] md:grid-cols-[minmax(240px,0.8fr)_minmax(0,1.7fr)]">
    <div className="relative min-h-[210px] overflow-hidden bg-blue-100 md:min-h-full">
      {imageUrl ? <Image
        src={imageUrl}
        alt="ภาพเป้าหมายด้านการเงินจากบอร์ดวิสัยทัศน์"
        fill
        priority
        sizes="(max-width: 767px) 100vw, 36vw"
        className="object-cover"
      /> : <div className="flex h-full min-h-[210px] items-center justify-center bg-gradient-to-br from-blue-100 to-sky-50 text-blue-600" aria-label="ยังไม่มีภาพเป้าหมายด้านการเงินในบอร์ดวิสัยทัศน์">
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-14 w-14"><path strokeLinecap="round" strokeLinejoin="round" d="M4 19.5h16M6.5 17V9.5h11V17M9 9.5V6.75h6V9.5M9.25 13h5.5" /></svg>
      </div>}
    </div>

    <div className="flex min-w-0 flex-col justify-center p-5 sm:p-7 lg:p-8">
      <p className="text-sm font-semibold text-blue-700">เป้าหมายหลักด้านการเงิน</p>
      <h1 className="mt-2 text-2xl font-semibold leading-tight text-slate-900 sm:text-3xl">สร้างบ้านเช่าให้สำเร็จตามเป้าหมาย</h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">บริหารงบประมาณและดำเนินงานก่อสร้างบ้านเช่าให้แล้วเสร็จ เพื่อสร้างรายได้ประจำและความมั่นคงทางการเงินในระยะยาว</p>

      <div className="mt-6 rounded-2xl border border-blue-100 bg-white/80 p-4 shadow-sm sm:p-5">
        <div className="flex items-center justify-between gap-4">
          <span className="font-medium text-slate-700">ความคืบหน้าการสร้างบ้านเช่า</span>
          <span className="font-numeric text-lg font-semibold text-blue-700">{progress.toFixed(1)}%</span>
        </div>
        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-blue-100" role="progressbar" aria-label="ความคืบหน้าการสร้างบ้านเช่า" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.min(progress, 100)}>
          <div className="h-full rounded-full bg-blue-600 transition-[width] duration-300" style={{ width: `${Math.min(progress, 100)}%` }} />
        </div>
        <p className="mt-3 text-sm text-slate-600">{checklist.length > 0 ? `สำเร็จแล้ว ${completedCount} จาก ${checklist.length} งาน` : 'ยังไม่มีรายการงาน'}</p>
      </div>
    </div>
  </article>;
}

function InvestmentProjectsSection({ data, onCreate }: { data: ConstructionInvestmentProjectsData; onCreate: () => void }) {
  const summary = getInvestmentProjectsSummary(data);
  const showPortfolioSummary = data.projects.length > 1;

  return <section id="investment-projects" className="scroll-mt-24 rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-[0_20px_45px_-30px_rgba(15,23,42,0.24)] md:p-6">
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <p className="text-[13px] font-semibold text-blue-600">Project Budget Monitor</p>
        <h2 className="mt-1 text-2xl font-semibold text-slate-900">โครงการลงทุน</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">ติดตามงบประมาณ ใช้จริง และค่าใช้จ่ายแยกตามโครงการ โดยคำนวณงบจากหมวดงานของแต่ละ project</p>
      </div>
      <button type="button" onClick={onCreate} className="theme-button-primary w-full !text-[#FFFFFF] sm:w-auto" style={{ color: '#FFFFFF' }}>สร้างโครงการใหม่</button>
    </div>

    {showPortfolioSummary ? <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-5">
      <ProjectMetric label="จำนวนโครงการ" value={`${summary.projectCount}`} />
      <ProjectMetric label="งบรวมทั้งหมด" value={thb.format(summary.totalBudget)} />
      <ProjectMetric label="ใช้จริงรวม" value={thb.format(summary.totalSpent)} valueClass="text-blue-600" />
      <ProjectMetric label="คงเหลือรวม" value={thb.format(summary.remaining)} valueClass={summary.remaining >= 0 ? 'text-emerald-600' : 'text-rose-600'} />
      <ProjectMetric label="ความคืบหน้ารวม" value={`${summary.financeProgress.toFixed(1)}%`} valueClass="text-blue-600" />
    </div> : null}

    {data.projects.length === 0 ? <div className="mt-5 rounded-2xl border border-dashed border-slate-300 p-6 text-center">
      <p className="text-lg font-semibold text-slate-900">ยังไม่มีโครงการลงทุน</p>
      <p className="mt-2 text-sm text-slate-500">สร้างโครงการแรกเพื่อเริ่มติดตามงบและค่าใช้จ่ายจริง</p>
      <button type="button" onClick={onCreate} className="theme-button-primary mt-4 !text-[#FFFFFF]" style={{ color: '#FFFFFF' }}>สร้างโครงการใหม่</button>
    </div> : <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
      {data.projects.map((project) => {
        const budgetData = getProjectBudgetData(data, project.id);
        return <InvestmentProjectCard key={project.id} budgetData={budgetData} />;
      })}
    </div>}
  </section>;
}

function InvestmentProjectCard({ budgetData }: { budgetData: ConstructionProjectBudgetData }) {
  const { totalBudget, totalSpent, remaining, financeProgress } = getConstructionBudgetSummary(budgetData);
  const project = budgetData.project;
  if (!project) return null;

  const status = (project.status ?? 'planning') as keyof typeof projectStatusLabel;
  return <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_14px_34px_-28px_rgba(15,23,42,0.5)] sm:p-5">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="break-words text-lg font-semibold text-slate-900">{project.name}</h3>
          <span className="status-badge status-info">{projectStatusLabel[status] ?? project.status ?? '-'}</span>
        </div>
        <p className="mt-2 text-sm leading-6 text-slate-500">{project.description || 'ไม่มีรายละเอียด'}</p>
      </div>
      <Link href={`/money-management/projects/${project.id}`} className="theme-button-primary shrink-0 text-center !text-[#FFFFFF]" style={{ color: '#FFFFFF' }}>ดูรายละเอียด</Link>
    </div>

    <div className="mt-4 grid grid-cols-2 gap-3 text-sm lg:grid-cols-4">
      <div><p className="text-xs text-slate-500">งบทั้งหมด</p><p className="font-numeric font-semibold text-slate-900">{thb.format(totalBudget)}</p></div>
      <div><p className="text-xs text-slate-500">ใช้จริง</p><p className="font-numeric font-semibold text-blue-600">{thb.format(totalSpent)}</p></div>
      <div><p className="text-xs text-slate-500">คงเหลือ</p><p className={`font-numeric font-semibold ${remaining >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{thb.format(remaining)}</p></div>
      <div><p className="text-xs text-slate-500">อัปเดตล่าสุด</p><p className="font-numeric font-semibold text-slate-900">{new Date(project.updated_at).toLocaleDateString('th-TH')}</p></div>
    </div>

    <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-3">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-semibold text-slate-900">Progress</span>
        <span className="font-numeric font-semibold text-blue-600">{financeProgress.toFixed(1)}%</span>
      </div>
      <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full rounded-full bg-[color:var(--accent-blue)]" style={{ width: `${Math.min(financeProgress, 100)}%` }} />
      </div>
    </div>
  </article>;
}

export function ProjectBudgetDetail({ budgetData, selectedCategory, onSelectCategory, onOpenExpenseForm, onManageCategory, onDeleteCategory, onEditExpense, onDeleteExpense }: { budgetData: ConstructionProjectBudgetData; selectedCategory: string | null; onSelectCategory: (categoryId: string) => void; onOpenExpenseForm: (costType: ConstructionCostType) => void; onManageCategory: (mode: CategoryManageMode, categoryId?: string) => void; onDeleteCategory: (categoryId: string) => void; onEditExpense: (expenseId: string) => void; onDeleteExpense: (expenseId: string) => void }) {
  const [openCategoryMenu, setOpenCategoryMenu] = useState<string | null>(null);
  const [categoryStatusFilter, setCategoryStatusFilter] = useState<CategoryStatusFilter>('all');
  const [financialAnalysisOpen, setFinancialAnalysisOpen] = useState(false);
  const project = budgetData.project;
  const summary = getConstructionBudgetSummary(budgetData);
  const categoryStatusCounts = useMemo(() => budgetData.categories.reduce<Record<ConstructionCategoryStatus, number>>((counts, category) => {
    counts[category.status] += 1;
    return counts;
  }, { not_started: 0, in_progress: 0, completed: 0 }), [budgetData.categories]);
  const filteredCategories = useMemo(() => categoryStatusFilter === 'all'
    ? budgetData.categories
    : budgetData.categories.filter((category) => category.status === categoryStatusFilter), [budgetData.categories, categoryStatusFilter]);
  const categoryFilterOptions: { value: CategoryStatusFilter; label: string; count: number }[] = [
    { value: 'all', label: 'ทั้งหมด', count: budgetData.categories.length },
    ...constructionStatusOptions.map((status) => ({ value: status, label: constructionStatusLabel[status], count: categoryStatusCounts[status] })),
  ];
  const emptyCategoryMessage: Record<CategoryStatusFilter, string> = {
    all: 'ยังไม่มีหมวดงานในโครงการนี้',
    not_started: 'ไม่มีงานที่ยังไม่เริ่ม',
    in_progress: 'ไม่มีงานที่กำลังดำเนินการ',
    completed: 'ยังไม่มีงานที่เสร็จแล้ว',
  };
  const uncategorizedExpenses = budgetData.expenses.filter((expense) => expense.category_id === null);
  const expenseDetailCategory = selectedCategory === 'uncategorized'
    ? null
    : budgetData.categories.find((category) => category.id === selectedCategory) ?? null;
  const expenseDetailOpen = selectedCategory === 'uncategorized' || Boolean(expenseDetailCategory);
  const expenseDetailItems = expenseDetailOpen
    ? budgetData.expenses.filter((expense) => selectedCategory === 'uncategorized' ? expense.category_id === null : expense.category_id === selectedCategory)
    : [];

  if (!project) {
    return <div className="rounded-[24px] border border-slate-200 bg-white p-6">
      <section>
        <h2 className="text-xl font-semibold text-slate-900">ยังไม่พบข้อมูลโครงการ</h2>
        <p className="mt-2 text-sm text-slate-500">รัน migration เพื่อสร้าง project และ seed ข้อมูลเริ่มต้นก่อนใช้งาน</p>
      </section>
    </div>;
  }

  return <section className="w-full rounded-[24px] border border-slate-200 bg-white shadow-[0_20px_45px_-30px_rgba(15,23,42,0.24)]">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-6">
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-blue-600">Project Budget Monitor</p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-900">{project.name}</h2>
            <p className="mt-1 text-sm text-slate-500">ดูภาพรวมก่อน แล้วเลือกหมวดงานเพื่อดูรายการค่าใช้จ่ายย้อนหลัง</p>
          </div>
          <button type="button" onClick={() => setFinancialAnalysisOpen(true)} aria-label="วิเคราะห์สถานะการเงินของโครงการ" className="theme-button-secondary w-full shrink-0 sm:w-auto">วิเคราะห์สถานะการเงิน</button>
        </div>

        <div className="px-5 py-5 sm:px-6">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
            <ProjectMetric label="งบรวมทั้งหมด" value={thb.format(summary.grandBudgetTotal)} />
            <ProjectMetric label="ใช้จริงรวม" value={thb.format(summary.grandActualTotal)} valueClass="text-blue-600" />
            <ProjectMetric label="คงเหลือรวม" value={thb.format(summary.grandRemainingTotal)} valueClass={summary.grandRemainingTotal >= 0 ? 'text-emerald-600' : 'text-rose-600'} />
            <ProjectMetric label="ความคืบหน้า" value={`${summary.progressPercent.toFixed(1)}%`} valueClass="text-blue-600" />
            <ProjectMetric label="อัปเดตล่าสุด" value={new Date(project.updated_at).toLocaleDateString('th-TH')} />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            <CostTypeSummaryCard
              title="ค่าวัสดุ / ค่าใช้จ่าย"
              budget={summary.materialBudgetTotal}
              actual={summary.materialActualTotal}
              remaining={summary.materialBudgetTotal - summary.materialActualTotal}
              percent={summary.materialBudgetTotal > 0 ? (summary.materialActualTotal / summary.materialBudgetTotal) * 100 : 0}
              tone="material"
            />
            <CostTypeSummaryCard
              title="ค่าแรง"
              budget={summary.laborBudgetTotal}
              actual={summary.laborActualTotal}
              remaining={summary.laborBudgetTotal - summary.laborActualTotal}
              percent={summary.laborBudgetTotal > 0 ? (summary.laborActualTotal / summary.laborBudgetTotal) * 100 : 0}
              tone="labor"
            />
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900">แยกตามหมวดงาน</p>
                <p className="text-sm text-slate-500">กรองรายการตามสถานะ เพื่อดูและจัดการหมวดงานได้ง่ายขึ้น</p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap lg:justify-end">
                <button onClick={() => onManageCategory('create')} className="theme-button-secondary w-full sm:w-auto">➕ เพิ่มหมวดงาน</button>
                <button onClick={() => onOpenExpenseForm('material')} className="theme-button-primary w-full !text-[#FFFFFF] sm:w-auto" style={{ color: '#FFFFFF' }}>เพิ่มค่าใช้จ่ายจริง</button>
                <button onClick={() => onOpenExpenseForm('labor')} className="theme-button-primary w-full !bg-violet-600 !text-[#FFFFFF] hover:!bg-violet-700 sm:w-auto" style={{ color: '#FFFFFF' }}>เพิ่มค่าแรงจริง</button>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2.5 sm:gap-3" role="group" aria-label="กรองหมวดงานตามสถานะ">
              {categoryFilterOptions.map((option) => <CategoryStatusFilterButton
                key={option.value}
                value={option.value}
                label={option.label}
                count={option.count}
                active={categoryStatusFilter === option.value}
                onSelect={setCategoryStatusFilter}
              />)}
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-4">
            {filteredCategories.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-5 text-center">
              <p className="text-sm font-medium text-slate-600">{emptyCategoryMessage[categoryStatusFilter]}</p>
            </div> : null}
            {filteredCategories.map((category) => <CostCategoryCard
              key={category.id}
              category={category}
              expenses={getCategoryExpenses(budgetData.expenses, category.id)}
              menuOpen={openCategoryMenu === category.id}
              onSelect={() => onSelectCategory(category.id)}
              onToggleMenu={() => setOpenCategoryMenu((current) => current === category.id ? null : category.id)}
              onManage={(mode) => { setOpenCategoryMenu(null); onManageCategory(mode, category.id); }}
              onDelete={() => { setOpenCategoryMenu(null); onDeleteCategory(category.id); }}
            />)}
            {categoryStatusFilter === 'all' && uncategorizedExpenses.length ? <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_12px_30px_-26px_rgba(15,23,42,0.45)] sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div><h3 className="text-base font-semibold text-slate-900">ไม่ระบุหมวด</h3><p className="mt-1 text-sm text-slate-500">{uncategorizedExpenses.length} รายการ · <span className="font-numeric font-semibold text-blue-600">{thb.format(uncategorizedExpenses.reduce((sum, expense) => sum + Number(expense.amount ?? 0), 0))}</span></p></div>
                <button type="button" onClick={() => onSelectCategory('uncategorized')} className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-blue-50 hover:text-blue-700 sm:w-auto" aria-label="ดูรายละเอียดค่าใช้จ่าย ไม่ระบุหมวด">ดูรายละเอียดค่าใช้จ่าย <span aria-hidden="true" className="text-xl leading-none">›</span></button>
              </div>
            </article> : null}
          </div>
        </div>
        {expenseDetailOpen ? <ProjectExpenseHistoryModal category={expenseDetailCategory} expenses={expenseDetailItems} onClose={() => onSelectCategory('')} onEditExpense={(expenseId) => { onSelectCategory(''); onEditExpense(expenseId); }} onDeleteExpense={(expenseId) => { onSelectCategory(''); onDeleteExpense(expenseId); }} /> : null}
        {financialAnalysisOpen ? <FinancialAnalysisDialog data={budgetData} onClose={() => setFinancialAnalysisOpen(false)} /> : null}
  </section>;
}

function ProjectMetric({ label, value, valueClass = 'text-slate-900' }: { label: string; value: string; valueClass?: string }) {
  return <article className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-[0_10px_26px_-24px_rgba(15,23,42,0.45)]">
    <p className="text-xs text-slate-500">{label}</p>
    <p className={`font-numeric mt-1 text-xl font-semibold tracking-tight ${valueClass}`}>{value}</p>
  </article>;
}

function CostTypeSummaryCard({ title, budget, actual, remaining, percent, tone }: { title: string; budget: number; actual: number; remaining: number; percent: number; tone: 'material' | 'labor' }) {
  const toneClass = tone === 'labor' ? 'border-violet-200 bg-violet-50/70 text-violet-700' : 'border-blue-200 bg-blue-50/70 text-blue-700';
  const barClass = tone === 'labor' ? 'bg-violet-500' : 'bg-[color:var(--accent-blue)]';
  return <article className={`rounded-2xl border p-4 ${toneClass}`}>
    <div className="flex items-center justify-between gap-3">
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <span className="font-numeric text-sm font-semibold">{percent.toFixed(1)}%</span>
    </div>
    <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
      <div><p className="text-xs text-slate-500">งบประมาณ</p><p className="font-numeric font-semibold text-slate-900">{thb.format(budget)}</p></div>
      <div><p className="text-xs text-slate-500">ใช้จริง</p><p className="font-numeric font-semibold">{thb.format(actual)}</p></div>
      <div><p className="text-xs text-slate-500">คงเหลือ</p><p className={`font-numeric font-semibold ${remaining >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{thb.format(remaining)}</p></div>
    </div>
    <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/80">
      <div className={`h-full rounded-full ${barClass}`} style={{ width: `${Math.min(percent, 100)}%` }} />
    </div>
  </article>;
}

function CostCategoryCard({ category, expenses, menuOpen, onSelect, onToggleMenu, onManage, onDelete }: { category: ConstructionCategoryRow; expenses: ConstructionExpenseRow[]; menuOpen: boolean; onSelect: () => void; onToggleMenu: () => void; onManage: (mode: CategoryManageMode) => void; onDelete: () => void }) {
  const summary = getCategoryBudgetSummary(category, expenses);
  const checklistProgress = getChecklistProgress(category);

  return <article className="relative rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-[0_12px_30px_-26px_rgba(15,23,42,0.45)] sm:p-5">
    <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-[minmax(0,6fr)_minmax(0,11fr)_minmax(180px,4fr)] lg:items-stretch lg:gap-6">
      <div className="min-w-0 pr-12 lg:self-center lg:pr-0">
        <h3 className="break-words text-base font-semibold text-slate-900 sm:text-lg">{category.name}</h3>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className={statusBadgeClass(category.status)}>{constructionStatusLabel[category.status] ?? category.status}</span>
          <span className={checklistProgress.total ? 'text-xs font-semibold text-emerald-700' : 'text-xs font-semibold text-slate-400'}>✓ {checklistProgress.done}/{checklistProgress.total} งาน</span>
        </div>
        <div className="mt-3 max-w-sm">
          <div className="flex items-center justify-between gap-2 text-xs font-semibold text-slate-500">
            <span>ความคืบหน้างาน</span>
            <span className="font-numeric text-slate-600">{Math.round(checklistProgress.percent)}%</span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.min(checklistProgress.percent, 100)}%` }} />
          </div>
        </div>
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-3 text-sm sm:grid-cols-2 lg:self-center">
        <div className="min-w-0 rounded-xl border border-blue-100 bg-blue-50/60 p-3">
        <p className="text-xs font-semibold text-blue-700">ค่าวัสดุ</p>
        <div className="mt-2 space-y-1">
          <BudgetLine label="งบ" value={summary.materialBudget} />
          <BudgetLine label="ใช้จริง" value={summary.materialActual} valueClass="text-blue-600" />
          <BudgetLine label="คงเหลือ" value={summary.materialRemaining} valueClass={summary.materialRemaining >= 0 ? 'text-emerald-600' : 'text-rose-600'} />
        </div>
        </div>
        <div className="min-w-0 rounded-xl border border-violet-100 bg-violet-50/60 p-3">
        <p className="text-xs font-semibold text-violet-700">ค่าแรง</p>
        <div className="mt-2 space-y-1">
          <BudgetLine label="งบ" value={summary.laborBudget} />
          <BudgetLine label="ใช้จริง" value={summary.laborActual} valueClass="text-violet-600" />
          <BudgetLine label="คงเหลือ" value={summary.laborRemaining} valueClass={summary.laborRemaining >= 0 ? 'text-emerald-600' : 'text-rose-600'} />
        </div>
        </div>
      </div>

      <div className="flex min-w-0 items-center justify-end lg:min-h-[112px] lg:flex-col lg:items-end lg:justify-between">
        <button type="button" onClick={(event) => { event.stopPropagation(); onToggleMenu(); }} className="absolute right-4 top-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-xl leading-none text-slate-600 hover:border-blue-200 hover:bg-blue-50 lg:static" aria-label={`จัดการ ${category.name}`} aria-expanded={menuOpen}>⋮</button>
        <button type="button" onClick={(event) => { event.stopPropagation(); onSelect(); }} className="flex w-full min-w-0 items-center justify-center gap-2 rounded-xl border border-transparent bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-blue-100 hover:bg-blue-50 hover:text-blue-700 lg:w-auto lg:whitespace-nowrap" aria-label={`ดูรายละเอียดค่าใช้จ่าย ${category.name}`}>
          <span className="min-w-0 break-words lg:break-normal">ดูรายละเอียดค่าใช้จ่าย</span>
          <span aria-hidden="true" className="shrink-0 text-xl leading-none">›</span>
        </button>
      </div>
    </div>

    {menuOpen ? <div onClick={(event) => event.stopPropagation()} className="absolute right-4 top-14 z-20 w-[min(14rem,calc(100%-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl lg:right-5 lg:top-16">
      <button type="button" onClick={() => onManage('operation')} className="block w-full rounded-xl px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50">รายละเอียดการดำเนินงาน</button>
      <button type="button" onClick={() => onManage('edit')} className="block w-full rounded-xl px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50">จัดการหมวดงาน</button>
      <button type="button" onClick={onDelete} className="block w-full rounded-xl px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50">ลบ</button>
    </div> : null}
  </article>;
}

function ProjectExpenseHistoryModal({ category, expenses, onClose, onEditExpense, onDeleteExpense }: { category: ConstructionCategoryRow | null; expenses: ConstructionExpenseRow[]; onClose: () => void; onEditExpense: (expenseId: string) => void; onDeleteExpense: (expenseId: string) => void }) {
  const [filter, setFilter] = useState<ExpenseFilter>('all');
  const dialogRef = useRef<HTMLElement>(null);
  const categoryName = category?.name ?? 'ไม่ระบุหมวด';
  const sortedExpenses = [...expenses].sort((a, b) => `${b.expense_date}-${b.created_at}`.localeCompare(`${a.expense_date}-${a.created_at}`));
  const visibleExpenses = sortedExpenses.filter((expense) => filter === 'all' || getExpenseCostType(expense) === filter);
  const materialActual = expenses.filter((expense) => getExpenseCostType(expense) === 'material').reduce((sum, expense) => sum + Number(expense.amount ?? 0), 0);
  const laborActual = expenses.filter((expense) => getExpenseCostType(expense) === 'labor').reduce((sum, expense) => sum + Number(expense.amount ?? 0), 0);

  useEffect(() => {
    const trigger = Array.from(document.querySelectorAll<HTMLElement>('button[aria-label]')).find((element) => element.getAttribute('aria-label') === `ดูรายละเอียดค่าใช้จ่าย ${categoryName}`) ?? null;
    const previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusTimer = window.setTimeout(() => dialogRef.current?.focus(), 0);
    const handleKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousBodyOverflow;
      trigger?.focus();
    };
  }, [categoryName, onClose]);

  return createPortal(<div className="fixed inset-0 z-[9999] flex h-screen w-screen items-center justify-center bg-slate-950/45 p-3 backdrop-blur-sm supports-[height:100dvh]:h-[100dvh] sm:p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="expense-history-title" tabIndex={-1} onMouseDown={(event) => event.stopPropagation()} className="flex max-h-[calc(100vh-24px)] w-[calc(100vw-24px)] max-w-[1100px] min-w-0 flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-2xl outline-none supports-[height:100dvh]:max-h-[calc(100dvh-24px)] sm:max-h-[88vh] sm:w-[min(1100px,calc(100vw-32px))]">
      <header className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
        <div className="min-w-0"><p className="text-[13px] font-semibold text-blue-600">รายการบันทึกจริง</p><h2 id="expense-history-title" className="mt-1 text-xl font-semibold text-slate-900 sm:text-2xl">รายละเอียดค่าใช้จ่าย</h2><p className="mt-1 break-words text-sm text-slate-500">{categoryName}</p></div>
        <button type="button" onClick={onClose} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-xl text-slate-600 hover:border-blue-200 hover:bg-blue-50" aria-label="ปิดรายละเอียดค่าใช้จ่าย">×</button>
      </header>

      <div className="shrink-0 border-b border-slate-200 bg-slate-50/60 px-4 py-4 sm:px-6">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          <ExpenseSummaryMetric label="งบค่าวัสดุ" value={Number(category?.budget ?? 0)} />
          <ExpenseSummaryMetric label="ใช้จริงค่าวัสดุ" value={materialActual} tone="material" />
          <ExpenseSummaryMetric label="งบค่าแรง" value={Number(category?.labor_budget ?? 0)} />
          <ExpenseSummaryMetric label="ใช้จริงค่าแรง" value={laborActual} tone="labor" />
          <ExpenseSummaryMetric label="รวมใช้จริงทั้งหมด" value={materialActual + laborActual} tone="total" className="col-span-2 sm:col-span-1" />
        </div>
        <div className="mt-4 flex w-full rounded-full border border-slate-200 bg-white p-1 text-xs font-semibold text-slate-600 sm:w-fit">
          {([{ value: 'all', label: 'ทั้งหมด' }, { value: 'material', label: 'ค่าวัสดุ' }, { value: 'labor', label: 'ค่าแรง' }] as const).map((option) => <button key={option.value} type="button" onClick={() => setFilter(option.value)} className={`flex-1 rounded-full px-3 py-2 transition sm:flex-none ${filter === option.value ? 'bg-blue-50 text-blue-700 shadow-sm' : 'hover:text-slate-900'}`}>{option.label}</button>)}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-4 py-4 sm:px-6">
        {visibleExpenses.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 p-6 text-center text-sm text-slate-500">ยังไม่มีรายการบันทึกจริงในหมวดงานนี้</div> : <>
          <div className="hidden md:block">
            <table className="w-full table-fixed text-sm">
              <thead className="text-left text-slate-500"><tr className="border-b border-slate-200"><th className="w-[12%] py-3 pr-3">วันที่</th><th className="w-[20%] py-3 pr-3">รายการ</th><th className="w-[12%] py-3 pr-3">กลุ่ม</th><th className="w-[14%] py-3 pr-3">ประเภท</th><th className="w-[16%] py-3 pr-3 text-right">จำนวนเงิน</th><th className="w-[16%] py-3 pr-3">หมายเหตุ</th><th className="w-[10%] py-3 text-right">จัดการ</th></tr></thead>
              <tbody>{visibleExpenses.map((expense) => <tr key={expense.id} className="border-b border-slate-100 align-top last:border-0"><td className="py-3 pr-3 font-numeric text-slate-700">{formatThaiDate(expense.expense_date)}</td><td className="break-words py-3 pr-3 font-semibold text-slate-900">{expense.title}</td><td className="py-3 pr-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getExpenseCostType(expense) === 'labor' ? 'bg-violet-50 text-violet-700' : 'bg-blue-50 text-blue-700'}`}>{getCostTypeLabel(getExpenseCostType(expense))}</span></td><td className="break-words py-3 pr-3 text-slate-600">{categoryName}</td><td className="py-3 pr-3 text-right font-numeric font-semibold text-slate-900">{thb.format(expense.amount)}</td><td className="break-words py-3 pr-3 text-slate-500">{expense.note ?? '-'}</td><td className="py-3"><div className="flex flex-col items-end gap-1.5"><button type="button" onClick={() => onEditExpense(expense.id)} className="text-xs font-semibold text-blue-700 hover:underline">แก้ไข</button><button type="button" onClick={() => onDeleteExpense(expense.id)} className="text-xs font-semibold text-rose-700 hover:underline">ลบ</button></div></td></tr>)}</tbody>
            </table>
          </div>
          <div className="space-y-3 md:hidden">{visibleExpenses.map((expense) => <article key={expense.id} className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="break-words font-semibold text-slate-900">{expense.title}</p><p className="mt-1 text-xs text-slate-500">{formatThaiDate(expense.expense_date)} · {categoryName}</p></div><span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${getExpenseCostType(expense) === 'labor' ? 'bg-violet-50 text-violet-700' : 'bg-blue-50 text-blue-700'}`}>{getCostTypeLabel(getExpenseCostType(expense))}</span></div><p className="font-numeric mt-3 text-lg font-semibold text-slate-900">{thb.format(expense.amount)}</p><p className="mt-2 break-words text-sm text-slate-500">{expense.note ?? '-'}</p><div className="mt-4 grid grid-cols-2 gap-2"><button type="button" onClick={() => onEditExpense(expense.id)} className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700">แก้ไข</button><button type="button" onClick={() => onDeleteExpense(expense.id)} className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">ลบ</button></div></article>)}</div>
        </>}
      </div>
    </section>
  </div>, document.body);
}

function ExpenseSummaryMetric({ label, value, tone = 'default', className = '' }: { label: string; value: number; tone?: 'default' | 'material' | 'labor' | 'total'; className?: string }) {
  const valueClass = tone === 'material' ? 'text-blue-600' : tone === 'labor' ? 'text-violet-600' : tone === 'total' ? 'text-emerald-600' : 'text-slate-900';
  return <article className={`min-w-0 rounded-xl border border-slate-200 bg-white p-3 ${className}`}><p className="text-xs text-slate-500">{label}</p><p className={`font-numeric mt-1 break-words text-sm font-semibold sm:text-base ${valueClass}`}>{thb.format(value)}</p></article>;
}

function BudgetLine({ label, value, valueClass = 'text-slate-900' }: { label: string; value: number; valueClass?: string }) {
  return <div className="flex items-center justify-between gap-2">
    <span className="text-xs text-slate-500">{label}</span>
    <span className={`font-numeric text-xs font-semibold ${valueClass}`}>{thb.format(value)}</span>
  </div>;
}

function ConstructionProjectForm({ onClose, onSubmit }: { onClose: () => void; onSubmit: (fd: FormData) => Promise<{ success: boolean; message: string }> }) {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  return <div className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
    <form onSubmit={async (event) => {
      event.preventDefault();
      setSaving(true);
      setMessage('');
      const result = await onSubmit(new FormData(event.currentTarget));
      setSaving(false);
      if (!result.success) setMessage(result.message);
    }} className="w-full max-w-lg rounded-[24px] border border-slate-200 bg-white p-5 shadow-2xl sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[13px] font-semibold text-blue-600">Investment Project</p>
          <h3 className="mt-1 text-xl font-semibold text-slate-900">สร้างโครงการใหม่</h3>
          <p className="mt-1 text-sm text-slate-500">สร้าง project ใหม่โดยไม่กระทบข้อมูลเดิมใน Supabase</p>
        </div>
        <button type="button" onClick={onClose} className="theme-button-secondary">ปิด</button>
      </div>

      <div className="mt-5 space-y-3">
        <label className="block"><span className="text-sm text-slate-600">ชื่อโครงการ</span><input name="name" className="theme-input mt-1" placeholder="เช่น โครงการลงทุนใหม่" required /></label>
        <label className="block"><span className="text-sm text-slate-600">รายละเอียด</span><textarea name="description" className="theme-textarea mt-1 min-h-24" placeholder="รายละเอียดหรือเป้าหมายของโครงการ" /></label>
        <label className="block"><span className="text-sm text-slate-600">สถานะ</span><select name="status" className="theme-select mt-1" defaultValue="planning">{projectStatusOptions.map((option) => <option key={option} value={option}>{projectStatusLabel[option]}</option>)}</select></label>
        <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-3 text-sm text-slate-700">
          <input name="create_default_category" type="checkbox" defaultChecked className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600" />
          <span><span className="font-semibold text-slate-900">สร้างหมวดพื้นฐานให้ด้วย</span><br /><span className="text-slate-500">ระบบจะสร้างหมวด “อื่น ๆ” งบ 0 ให้ project นี้</span></span>
        </label>
        {message ? <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{message}</div> : null}
      </div>

      <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button type="button" onClick={onClose} className="theme-button-secondary">ยกเลิก</button>
        <button disabled={saving} className="theme-button-primary !text-[#FFFFFF] disabled:bg-slate-300" style={{ color: '#FFFFFF' }}>{saving ? 'กำลังสร้าง...' : 'สร้างโครงการ'}</button>
      </div>
    </form>
  </div>;
}

function CategoryManagementForm({ mode, project, nextSortOrder, category, onClose, onSubmit }: { mode: CategoryManageMode; project: ConstructionProjectRow | null; nextSortOrder: number; category: ConstructionCategoryRow | null; onClose: () => void; onSubmit: (fd: FormData) => Promise<{ success: boolean; message: string }> }) {
  const [name, setName] = useState(category?.name ?? '');
  const [budget, setBudget] = useState(formatMoneyInput(String(category?.budget ?? 0)));
  const [laborBudget, setLaborBudget] = useState(formatMoneyInput(String(category?.labor_budget ?? 0)));
  const [status, setStatus] = useState<ConstructionCategoryStatus>(category?.status ?? 'not_started');
  const [operationDetail, setOperationDetail] = useState(category?.operation_detail ?? '');
  const [operationNote, setOperationNote] = useState(category?.operation_note ?? '');
  const [operationChecklist, setOperationChecklist] = useState<ConstructionOperationChecklistItem[]>(getOperationChecklist(category));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const title = mode === 'operation' ? 'รายละเอียดการดำเนินงาน' : mode === 'create' ? 'เพิ่มหมวดงาน' : 'อัปเดตหมวดงาน';
  const operationDone = operationChecklist.filter((item) => item.done).length;
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const activeElement = document.activeElement instanceof HTMLElement && document.activeElement !== document.body ? document.activeElement : null;
    const categoryMenuButton = category
      ? Array.from(document.querySelectorAll<HTMLElement>('button[aria-label]')).find((element) => element.getAttribute('aria-label') === `จัดการ ${category.name}`) ?? null
      : null;
    const previouslyFocused = activeElement ?? categoryMenuButton;
    const previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusTimer = window.setTimeout(() => (firstFieldRef.current ?? dialogRef.current)?.focus(), 0);
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousBodyOverflow;
      previouslyFocused?.focus();
    };
  }, [category, onClose]);

  const addChecklistItem = () => setOperationChecklist((items) => [...items, { id: createChecklistId(), title: '', done: false }]);
  const updateChecklistItem = (id: string, patch: Partial<ConstructionOperationChecklistItem>) => {
    setOperationChecklist((items) => items.map((item) => item.id === id ? { ...item, ...patch } : item));
  };
  const deleteChecklistItem = (id: string) => setOperationChecklist((items) => items.filter((item) => item.id !== id));

  return createPortal(<div
    className="fixed inset-0 z-[9999] flex h-screen w-screen items-center justify-center overflow-hidden bg-slate-950/45 p-2 backdrop-blur-sm supports-[height:100dvh]:h-[100dvh] sm:p-4"
    onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}
  >
    <form ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="category-management-title" tabIndex={-1} onMouseDown={(event) => event.stopPropagation()} onSubmit={async (event) => {
      event.preventDefault();
      setSaving(true);
      setMessage('');
      const fd = new FormData();
      if (category) fd.set('id', category.id);
      if (project) fd.set('project_id', project.id);
      fd.set('name', name);
      fd.set('budget', cleanMoneyInput(budget));
      fd.set('labor_budget', cleanMoneyInput(laborBudget));
      fd.set('status', status);
      fd.set('sort_order', String(category?.sort_order ?? nextSortOrder));
      if (mode === 'operation') {
        fd.set('operation_detail', operationDetail);
        fd.set('operation_note', operationNote);
        fd.set('operation_checklist', JSON.stringify(operationChecklist.filter((item) => item.title.trim()).map((item) => ({ ...item, title: item.title.trim() }))));
      }
      const result = await onSubmit(fd);
      setSaving(false);
      if (!result.success) setMessage(result.message);
    }} className={`flex max-h-[calc(100vh-16px)] w-[calc(100vw-16px)] min-w-0 flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-2xl outline-none supports-[height:100dvh]:max-h-[calc(100dvh-16px)] sm:max-h-[calc(100vh-32px)] sm:w-[min(760px,calc(100vw-32px))] sm:supports-[height:100dvh]:max-h-[calc(100dvh-32px)] ${mode === 'operation' ? '' : 'sm:max-w-lg'}`}>
      <header className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-blue-600">{mode === 'operation' ? 'Operation Detail' : 'Category Settings'}</p>
          <h3 id="category-management-title" className="mt-1 break-words text-xl font-semibold text-slate-900">{title}</h3>
          <p className="mt-1 text-sm text-slate-500">อัปเดตชื่อหมวดงาน สถานะ และงบประมาณของหมวดนี้ ระบบจะบันทึกและอัปเดตข้อมูลทันที</p>
        </div>
        <button type="button" onClick={onClose} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-xl text-slate-600 hover:border-blue-200 hover:bg-blue-50" aria-label="ปิด">×</button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-4 py-5 sm:px-6">
       <div className="min-w-0 space-y-3">
        <label className="block min-w-0"><span className="text-sm text-slate-600">ชื่อหมวดงาน</span><input ref={firstFieldRef} className="theme-input mt-1 w-full min-w-0" value={name} onChange={(event) => setName(event.target.value)} placeholder="เช่น งานไฟฟ้า" required /></label>
        <label className="block"><span className="text-sm text-slate-600">สถานะ</span><select className="theme-select mt-1" value={status} onChange={(event) => setStatus(event.target.value as ConstructionCategoryStatus)}>{constructionStatusOptions.map((option) => <option key={option} value={option}>{constructionStatusLabel[option]}</option>)}</select></label>
        {mode === 'operation' ? <>
          <label className="block"><span className="text-sm text-slate-600">รายละเอียดการดำเนินงาน</span><textarea className="theme-textarea mt-1 min-h-32" value={operationDetail} onChange={(event) => setOperationDetail(event.target.value)} placeholder="บันทึกขั้นตอนการทำงาน รายละเอียดหน้างาน หรือสิ่งที่ต้องติดตาม" /></label>
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">Checklist</p>
                <p className="text-xs text-slate-500">{operationDone}/{operationChecklist.length} รายการ</p>
              </div>
              <button type="button" onClick={addChecklistItem} className="theme-button-secondary w-full sm:w-auto">เพิ่มรายการ</button>
            </div>
            <div className="mt-3 space-y-2">
              {operationChecklist.length === 0 ? <div className="rounded-xl border border-dashed border-slate-300 bg-white p-4 text-center text-sm text-slate-500">ยังไม่มี checklist เพิ่มรายการแรกเพื่อเริ่มติดตามงาน</div> : null}
              {operationChecklist.map((item) => <div key={item.id} className="flex min-w-0 items-center gap-2 rounded-xl border border-slate-200 bg-white p-2">
                <input type="checkbox" checked={item.done} onChange={(event) => updateChecklistItem(item.id, { done: event.target.checked })} className="h-4 w-4 shrink-0 rounded border-slate-300 text-blue-600" />
                <input className="theme-input min-h-10 min-w-0 flex-1 py-2 text-sm" value={item.title} onChange={(event) => updateChecklistItem(item.id, { title: event.target.value })} placeholder="เช่น ตรวจระดับพื้น / ส่งของ / เก็บงาน" />
                <button type="button" onClick={() => deleteChecklistItem(item.id)} className="shrink-0 rounded-full border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100">ลบ</button>
              </div>)}
            </div>
          </div>
          <label className="block"><span className="text-sm text-slate-600">หมายเหตุ</span><textarea className="theme-textarea mt-1 min-h-24" value={operationNote} onChange={(event) => setOperationNote(event.target.value)} placeholder="หมายเหตุเพิ่มเติม" /></label>
        </> : <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block"><span className="text-sm text-slate-600">งบค่าวัสดุ / ค่าใช้จ่าย</span><input inputMode="numeric" className="theme-input mt-1 font-numeric" value={budget} onChange={(event) => setBudget(formatMoneyInput(event.target.value))} placeholder="90,000" /></label>
          <label className="block"><span className="text-sm text-slate-600">งบค่าแรง</span><input inputMode="numeric" className="theme-input mt-1 font-numeric" value={laborBudget} onChange={(event) => setLaborBudget(formatMoneyInput(event.target.value))} placeholder="0" /></label>
        </div>}
        {message ? <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{message}</div> : null}
       </div>
      </div>

      <footer className="grid shrink-0 grid-cols-2 gap-2 border-t border-slate-200 bg-white px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 sm:flex sm:justify-end sm:px-6">
        <button type="button" onClick={onClose} className="theme-button-secondary w-full sm:w-auto">ยกเลิก</button>
        <button disabled={saving || !project} className="theme-button-primary w-full !text-[#FFFFFF] disabled:bg-slate-300 sm:w-auto" style={{ color: '#FFFFFF' }}>{saving ? 'กำลังบันทึก...' : 'บันทึก'}</button>
      </footer>
    </form>
  </div>, document.body);
}

function DeleteCategoryConfirm({ category, expenseCount, onClose, onConfirm }: { category: ConstructionCategoryRow | null; expenseCount: number; onClose: () => void; onConfirm: () => Promise<{ success: boolean; message: string }> }) {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  return <div className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
    <section className="w-full max-w-lg rounded-[24px] border border-slate-200 bg-white p-5 shadow-2xl sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[13px] font-semibold text-rose-600">Delete Category</p>
          <h3 className="mt-1 text-xl font-semibold text-slate-900">ลบหมวดงาน</h3>
          <p className="mt-1 text-sm text-slate-500">ยืนยันการลบ “{category?.name ?? '-'}”</p>
        </div>
        <button type="button" onClick={onClose} className="theme-button-secondary">ปิด</button>
      </div>
      {expenseCount > 0 ? <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">หมวดนี้มีค่าใช้จ่ายอยู่ ระบบจะย้ายรายการไปเป็นไม่ระบุหมวด</div> : null}
      {message ? <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{message}</div> : null}
      <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button type="button" onClick={onClose} className="theme-button-secondary">ยกเลิก</button>
        <button disabled={saving || !category} onClick={async () => {
          setSaving(true);
          setMessage('');
          const result = await onConfirm();
          setSaving(false);
          if (!result.success) setMessage(result.message);
        }} className="theme-button-primary !bg-rose-600 !text-[#FFFFFF] disabled:!bg-slate-300" style={{ color: '#FFFFFF' }}>{saving ? 'กำลังลบ...' : 'ลบหมวดงาน'}</button>
      </div>
    </section>
  </div>;
}

function DeleteExpenseConfirm({ expense, onClose, onConfirm }: { expense: ConstructionExpenseRow | null; onClose: () => void; onConfirm: () => Promise<{ success: boolean; message: string }> }) {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  return <div className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
    <section className="w-full max-w-lg rounded-[24px] border border-slate-200 bg-white p-5 shadow-2xl sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[13px] font-semibold text-rose-600">Delete Expense</p>
          <h3 className="mt-1 text-xl font-semibold text-slate-900">ลบรายการค่าใช้จ่าย</h3>
          <p className="mt-1 text-sm text-slate-500">ต้องการลบรายการค่าใช้จ่ายนี้ใช่ไหม?</p>
        </div>
        <button type="button" onClick={onClose} className="theme-button-secondary">ปิด</button>
      </div>

      <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="font-semibold text-slate-900">{expense?.title ?? '-'}</p>
        <p className="mt-1 text-sm text-slate-500">{expense ? `${formatThaiDate(expense.expense_date)} · ${thb.format(expense.amount)}` : '-'}</p>
      </div>

      {message ? <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{message}</div> : null}
      <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button type="button" onClick={onClose} className="theme-button-secondary">ยกเลิก</button>
        <button disabled={saving || !expense} onClick={async () => {
          setSaving(true);
          setMessage('');
          const result = await onConfirm();
          setSaving(false);
          if (!result.success) setMessage(result.message);
        }} className="theme-button-primary !bg-rose-600 !text-[#FFFFFF] disabled:!bg-slate-300" style={{ color: '#FFFFFF' }}>{saving ? 'กำลังลบ...' : 'ลบรายการ'}</button>
      </div>
    </section>
  </div>;
}

function ActualExpenseForm({ project, categories, expense, initialCostType, onClose, onSubmit }: { project: ConstructionProjectRow | null; categories: ConstructionCategoryRow[]; expense: ConstructionExpenseRow | null; initialCostType: ConstructionCostType; onClose: () => void; onSubmit: (fd: FormData) => Promise<{ success: boolean; message: string }> }) {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [costType, setCostType] = useState<ConstructionCostType>(expense ? getExpenseCostType(expense) : initialCostType);
  const today = new Date().toISOString().slice(0, 10);
  const isEditing = Boolean(expense);
  const isLabor = costType === 'labor';

  return <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
    <form onSubmit={async (event) => {
      event.preventDefault();
      setSaving(true);
      setMessage('');
      const fd = new FormData(event.currentTarget);
      if (expense) fd.set('id', expense.id);
      if (project) fd.set('project_id', project.id);
      fd.set('cost_type', costType);
      const result = await onSubmit(fd);
      setSaving(false);
      if (!result.success) setMessage(result.message);
    }} className="w-full max-w-xl rounded-[24px] border border-slate-200 bg-white p-5 shadow-2xl sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={`text-[13px] font-semibold ${isLabor ? 'text-violet-600' : 'text-blue-600'}`}>Actual Record</p>
          <h3 className="mt-1 text-xl font-semibold text-slate-900">{isEditing ? 'แก้ไขรายการบันทึกจริง' : isLabor ? 'เพิ่มค่าแรงจริง' : 'เพิ่มค่าใช้จ่ายจริง'}</h3>
          <p className="mt-1 text-sm text-slate-500">บันทึกลง Supabase และคำนวณ dashboard ใหม่ทันที</p>
        </div>
        <button type="button" onClick={onClose} className="theme-button-secondary">ปิด</button>
      </div>
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="block"><span className="text-sm text-slate-600">วันที่</span><input name="expense_date" type="date" className="theme-input mt-1" defaultValue={expense?.expense_date ?? today} required /></label>
        <label className="block"><span className="text-sm text-slate-600">หมวดงาน</span><select name="category_id" className="theme-select mt-1" defaultValue={expense?.category_id ?? categories[0]?.id ?? ''}><option value="">ไม่ระบุหมวด</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
        <label className="block"><span className="text-sm text-slate-600">กลุ่ม</span><select className="theme-select mt-1" value={costType} onChange={(event) => setCostType(event.target.value as ConstructionCostType)}><option value="material">ค่าวัสดุ / ค่าใช้จ่าย</option><option value="labor">ค่าแรง</option></select></label>
        <label className="block sm:col-span-2"><span className="text-sm text-slate-600">{isLabor ? 'รายการงาน / คนงาน / จำนวนวันหรือชั่วโมง' : 'รายการ'}</span><input name="title" className="theme-input mt-1" defaultValue={expense?.title ?? ''} placeholder={isLabor ? 'เช่น ค่าแรงช่าง 2 คน 3 วัน' : 'เช่น ค่าเหล็ก'} required /></label>
        <label className="block"><span className="text-sm text-slate-600">จำนวนเงิน</span><input name="amount" type="number" min="0" step="0.01" className="theme-input mt-1" defaultValue={expense?.amount ?? ''} placeholder="0" required /></label>
        <label className="block sm:col-span-2"><span className="text-sm text-slate-600">หมายเหตุ</span><textarea name="note" className="theme-textarea mt-1 min-h-24" defaultValue={expense?.note ?? ''} placeholder="รายละเอียดเพิ่มเติม" /></label>
        {message ? <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 sm:col-span-2">{message}</div> : null}
      </div>
      <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button type="button" onClick={onClose} className="theme-button-secondary">ยกเลิก</button>
        <button disabled={saving || !project} className={`theme-button-primary !text-[#FFFFFF] disabled:bg-slate-300 ${isLabor ? '!bg-violet-600 hover:!bg-violet-700' : ''}`} style={{ color: '#FFFFFF' }}>{saving ? 'กำลังบันทึก...' : isEditing ? 'บันทึกการแก้ไข' : isLabor ? 'บันทึกค่าแรง' : 'บันทึกค่าใช้จ่าย'}</button>
      </div>
    </form>
  </div>;
}

function MonthlyIncomeCard({ rows, summary, onCreate, onEdit, onDelete }: { rows: MoneyIncomeSourceRow[]; summary: MoneySummary; onCreate: () => void; onEdit: (row: MoneyIncomeSourceRow) => void; onDelete: (id: string) => void }) {
  const activeRows = rows.filter((row) => row.is_active !== false);
  const largestIncomeSource = activeRows.reduce<MoneyIncomeSourceRow | null>((largest, row) => {
    if (!largest) return row;
    return Number(row.income_amount) > Number(largest.income_amount) ? row : largest;
  }, null);
  const chartData = activeRows
    .filter((row) => Number(row.income_amount) > 0)
    .map((row, index) => ({
      name: row.name,
      value: Number(row.income_amount),
      color: incomeBreakdownColors[index % incomeBreakdownColors.length],
      pct: summary.grossIncome > 0 ? (Number(row.income_amount) / summary.grossIncome) * 100 : 0,
    }));

  return <section className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-[0_20px_45px_-30px_rgba(15,23,42,0.24)] md:p-6 lg:p-7">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">ภาพรวมรายเดือน</p>
        <h2 className="mt-1 text-xl font-semibold text-slate-900">รายได้ต่อเดือน</h2>
        <p className="mt-1 text-sm text-slate-500">สรุปยอดและจัดการแหล่งรายได้ในที่เดียว</p>
      </div>
      <button type="button" onClick={onCreate} className="theme-button-primary min-h-11 w-full sm:w-auto">+ เพิ่มแหล่งรายได้</button>
    </div>

    <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
      <IncomeOverviewMetric label="รายได้รวมต่อเดือน" value={thb.format(summary.grossIncome)} valueClass="text-slate-900" />
      <IncomeOverviewMetric label="ค่าใช้จ่าย/หักออกจากรายได้" value={thb.format(summary.totalExpense)} valueClass="text-rose-600" />
      <IncomeOverviewMetric label="รายได้สุทธิ" value={thb.format(summary.netIncome)} valueClass="text-emerald-600" />
    </div>

    <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-500">
      <span>แหล่งรายได้หลักที่มากที่สุด:</span>
      <span className="font-semibold text-slate-800">{largestIncomeSource?.name ?? 'ยังไม่มีข้อมูลรายได้'}</span>
      {largestIncomeSource ? <span className="font-numeric text-slate-700">({thb.format(Number(largestIncomeSource.income_amount))})</span> : null}
    </div>

    <div className="mt-6 grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.85fr)] xl:items-start">
      <div className="min-w-0">
        {rows.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-slate-500">ยังไม่มีแหล่งรายได้ กด “เพิ่มแหล่งรายได้” เพื่อเริ่มต้น</div> : <>
          <div className="hidden overflow-x-auto md:block"><table className="w-full min-w-[680px] text-xs lg:text-sm"><thead className="text-left text-slate-500"><tr><th className="py-3 pr-3">แหล่งรายได้</th><th className="py-3 pr-3">รายได้</th><th className="py-3 pr-3">ค่าใช้จ่าย</th><th className="py-3 pr-3">คงเหลือ</th><th className="py-3">จัดการ</th></tr></thead><tbody>{rows.map((r) => <tr key={r.id} className="border-t border-slate-100"><td className="py-3 pr-3"><p className="font-medium text-slate-800">{r.name}</p><p className="text-[11px] text-slate-500 lg:text-xs">{r.description ?? '-'}</p></td><td className="font-numeric py-3 pr-3 text-emerald-600">{thb.format(r.income_amount)}</td><td className="font-numeric py-3 pr-3 text-rose-600">{thb.format(r.expense_amount)} <span className="text-[10px] text-slate-500 lg:text-xs">{r.expense_note ? `(${r.expense_note})` : ''}</span></td><td className="font-numeric py-3 pr-3 font-semibold text-emerald-600">{thb.format(r.income_amount - r.expense_amount)}</td><td className="py-3"><div className="flex gap-3 whitespace-nowrap"><button type="button" onClick={() => onEdit(r)} className="text-slate-600 hover:text-blue-700">แก้ไข</button><button type="button" onClick={() => onDelete(r.id)} className="text-rose-600 hover:text-rose-700">ลบ</button></div></td></tr>)}</tbody></table></div>
          <div className="space-y-3 md:hidden">{rows.map((r) => <article key={r.id} className="min-w-0 rounded-2xl border border-slate-200 p-4"><p className="break-words font-semibold text-slate-800">{r.name}</p><p className="mt-1 break-words text-sm text-slate-500">{r.description || '-'}</p><dl className="mt-3 grid grid-cols-1 gap-2 text-sm xs:grid-cols-3"><div><dt className="text-slate-500">รายได้</dt><dd className="font-numeric break-words text-emerald-600">{thb.format(r.income_amount)}</dd></div><div><dt className="text-slate-500">ค่าใช้จ่าย</dt><dd className="font-numeric break-words text-rose-600">{thb.format(r.expense_amount)}</dd></div><div><dt className="text-slate-500">คงเหลือ</dt><dd className="font-numeric break-words font-semibold text-emerald-600">{thb.format(r.income_amount - r.expense_amount)}</dd></div></dl><div className="mt-4 flex gap-4"><button type="button" onClick={() => onEdit(r)} className="text-sm font-medium text-blue-700">แก้ไข</button><button type="button" onClick={() => onDelete(r.id)} className="text-sm font-medium text-rose-600">ลบ</button></div></article>)}</div>
        </>}
        <button type="button" onClick={onCreate} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 p-3 text-sm font-medium text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"><span aria-hidden="true">+</span> เพิ่มแหล่งรายได้ใหม่</button>
      </div>

      <aside className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
        <p className="text-sm font-semibold text-slate-900">สัดส่วนรายได้</p>
        <p className="mt-1 text-xs leading-relaxed text-slate-500">สัดส่วนรายได้แต่ละแหล่งในเดือนนี้</p>
      {chartData.length === 0 ? <div className="mt-4 rounded-2xl border border-dashed border-slate-200 p-5 text-center text-sm text-slate-500">ยังไม่มีรายได้สำหรับแสดงกราฟ</div> : <div className="mt-4 flex min-w-0 flex-col gap-5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center xl:flex-col">
        <div className="mx-auto h-[150px] w-[150px] shrink-0 sm:mx-0 sm:h-[160px] sm:w-[160px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={44} outerRadius={68} paddingAngle={3} stroke="none">
                {chartData.map((item) => <Cell key={item.name} fill={item.color} />)}
              </Pie>
              <Tooltip formatter={(value: number) => thb.format(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="w-full min-w-0 flex-1 space-y-3">
          {chartData.map((item) => <div key={item.name} className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 border-0 text-sm no-underline decoration-transparent">
            <div className="flex min-w-0 items-start gap-2.5 border-0 no-underline decoration-transparent"><span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} /><span className="break-words text-sm leading-snug text-slate-700 no-underline decoration-transparent sm:text-base">{item.name}</span></div>
            <div className="shrink-0 text-right"><p className="font-semibold leading-tight text-slate-900">{compactThb(item.value)}</p><p className="mt-0.5 text-sm leading-tight text-slate-500">{item.pct.toFixed(1)}%</p></div>
          </div>)}
        </div>
      </div>}
      </aside>
    </div>
  </section>;
}

function IncomeOverviewMetric({ label, value, valueClass }: { label: string; value: string; valueClass: string }) {
  return <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-[0_10px_26px_-24px_rgba(15,23,42,0.45)]">
    <p className="text-xs font-medium text-slate-500">{label}</p>
    <p className={`mt-1 text-lg font-semibold tracking-tight ${valueClass}`}>{value}</p>
  </div>;
}

const assetSummaryVariantClass: Record<AssetCategory, { accent: string; border: string; icon: string; iconBackground: string }> = {
  investment: { accent: 'bg-blue-600', border: 'hover:border-blue-300', icon: 'text-blue-700', iconBackground: 'border-blue-100 bg-blue-50' },
  safe: { accent: 'bg-teal-600', border: 'hover:border-teal-300', icon: 'text-teal-700', iconBackground: 'border-teal-100 bg-teal-50' },
  future: { accent: 'bg-violet-600', border: 'hover:border-violet-300', icon: 'text-violet-700', iconBackground: 'border-violet-100 bg-violet-50' },
  receivable: { accent: 'bg-amber-500', border: 'hover:border-amber-300', icon: 'text-amber-700', iconBackground: 'border-amber-100 bg-amber-50' },
};

function AssetCategorySummaryCard({ title, value, percentage, icon: Icon, variant }: { title: string; value: number; percentage: number; icon: LucideIcon; variant: AssetCategory }) {
  const style = assetSummaryVariantClass[variant];
  return <article className={`relative h-full min-h-[164px] overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 pt-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${style.border}`}>
    <div className={`absolute inset-x-0 top-0 h-1 ${style.accent}`} />
    <div className="flex items-center gap-3">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${style.iconBackground}`}>
        <Icon aria-hidden="true" className={`h-5 w-5 ${style.icon}`} strokeWidth={2} />
      </span>
      <h3 className="text-sm font-semibold text-slate-800 sm:text-base">{title}</h3>
    </div>
    <p className="font-numeric mt-4 break-words text-2xl font-bold tracking-tight text-slate-950 sm:text-[28px]">{thb.format(value)}</p>
    <p className="mt-2 text-xs leading-5 text-slate-500 sm:text-sm">สัดส่วน <span className="font-numeric font-semibold text-slate-700">{percentage.toFixed(2)}%</span> ของสินทรัพย์ทั้งหมด</p>
  </article>;
}

function GrowthAssetsCard({ rows, totalValue, totalProfitLoss, onCreate, onEdit, onDelete }: { rows: GrowthAssetRow[]; totalValue: number; totalProfitLoss: number; onCreate: () => void; onEdit: (row: GrowthAssetRow) => void; onDelete: (id: string) => void }) {
  const [activeSlice, setActiveSlice] = useState<string | null>(null);
  const viewRows = rows.map((row) => {
    const category = row.asset_type as AssetCategory;
    return { ...row, category, effectiveCurrentValue: category === 'receivable' ? Number(row.invested_amount) : Number(row.current_value), profit_loss: Number(row.profit_loss), return_percent: Number(row.return_percent) };
  });
  const categorySummary = assetCategories.reduce((acc, key) => ({ ...acc, [key]: 0 }), {} as Record<AssetCategory, number>);
  viewRows.forEach((row) => { categorySummary[row.category] += row.effectiveCurrentValue; });
  const adjustedTotalValue = viewRows.reduce((sum, row) => sum + row.effectiveCurrentValue, 0);
  const totalAssetValue = adjustedTotalValue || totalValue;
  const adjustedTotalProfit = viewRows.reduce((sum, row) => sum + (row.category === 'receivable' ? 0 : row.profit_loss), 0);
  const adjustedTotalReturn = adjustedTotalValue > 0 ? (adjustedTotalProfit / adjustedTotalValue) * 100 : 0;
  const chartDataWithPct = assetCategories.map((key) => ({ key, name: categoryMeta[key].label, value: categorySummary[key], color: categoryMeta[key].color, pct: totalAssetValue > 0 ? (categorySummary[key] / totalAssetValue) * 100 : 0 })).filter((item) => item.value > 0);
  const largestAllocation = chartDataWithPct.reduce((top, item) => (item.value > top.value ? item : top), chartDataWithPct[0] ?? null);

  return <section className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-[0_20px_45px_-30px_rgba(15,23,42,0.24)] md:p-6 lg:p-7">
    <div className="flex items-start justify-between gap-3"><div><h2 className="text-xl font-semibold text-slate-900">สินทรัพย์ทั้งหมด</h2><p className="text-sm text-slate-500">จัดกลุ่มตามประเภท</p></div><button className="rounded-xl bg-[#12233f] px-3 py-2 text-xs font-semibold text-white">ดูทั้งหมด</button></div>
    <div className="mt-7 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_300px] xl:items-stretch xl:gap-8">
      <div className="space-y-5"><div><p className="text-sm text-slate-500">มูลค่ารวม</p><p className="mt-1 text-3xl font-bold text-slate-900">{thb.format(totalAssetValue)}</p><p className="mt-4 text-sm text-slate-500">กำไร/ขาดทุนรวม</p><p className="mt-1 text-xl font-semibold"><span className={financialColorClass(adjustedTotalProfit)}>{thb.format(adjustedTotalProfit || totalProfitLoss)}</span> <span className={financialColorClass(adjustedTotalReturn)}>({adjustedTotalReturn >= 0 ? '+' : ''}{adjustedTotalReturn.toFixed(2)}%)</span></p></div>
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">{assetCategories.map((key) => <AssetCategorySummaryCard
          key={key}
          title={categoryMeta[key].label}
          value={categorySummary[key]}
          percentage={adjustedTotalValue > 0 ? (categorySummary[key] / adjustedTotalValue) * 100 : 0}
          icon={categoryMeta[key].icon}
          variant={key}
        />)}</div>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 shadow-[0_12px_30px_-24px_rgba(15,23,42,0.55)] sm:p-5"><div><h3 className="text-base font-semibold text-slate-900">สัดส่วนพอร์ต</h3><p className="text-xs text-slate-500">สัดส่วนสินทรัพย์ตามหมวดหมู่</p></div><div className="mx-auto mt-3 h-44 w-full max-w-[230px] sm:h-48"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={chartDataWithPct} dataKey="value" nameKey="name" innerRadius={52} outerRadius={70} paddingAngle={2} stroke="none" onMouseLeave={() => setActiveSlice(null)}>{chartDataWithPct.map((item) => <Cell key={item.key} fill={item.color} fillOpacity={activeSlice ? (activeSlice === item.key ? 1 : 0.38) : 0.85} stroke={activeSlice === item.key ? '#334155' : 'none'} strokeWidth={activeSlice === item.key ? 1.5 : 0} onMouseEnter={() => setActiveSlice(item.key)} />)}</Pie><text x="50%" y="47%" textAnchor="middle" className="fill-slate-900 text-[18px] font-semibold">{compactThb(totalAssetValue)}</text><text x="50%" y="58%" textAnchor="middle" className="fill-slate-500 text-[11px]">สินทรัพย์ทั้งหมด</text><Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid #E2E8F0' }} formatter={(value: number) => thb.format(value)} /></PieChart></ResponsiveContainer></div><div className="mt-2 border-t border-slate-200/90 pt-3"><p className="text-[11px] font-medium tracking-wide text-slate-500">สัดส่วนสูงสุด</p><p className="mt-1 text-sm font-semibold text-slate-800">{largestAllocation ? `${largestAllocation.name} • ${largestAllocation.pct.toFixed(2)}%` : '-'}</p></div></div>
    </div>
    <div className="mt-7 rounded-2xl bg-slate-50/70 max-lg:overflow-x-auto"><table className="w-full text-xs sm:text-sm max-lg:min-w-[620px]"><thead className="text-left text-slate-500"><tr><th className="px-3 py-3.5 sm:px-5">สินทรัพย์</th><th className="px-3 py-3.5 sm:px-5">ประเภท</th><th className="px-3 py-3.5 sm:px-5">มูลค่าปัจจุบัน</th><th className="px-3 py-3.5 sm:px-5">กำไร/ขาดทุน</th><th className="px-3 py-3.5 sm:px-5">ผลตอบแทน</th><th className="px-3 py-3.5 sm:px-5">จัดการ</th></tr></thead><tbody>{viewRows.map((r) => <tr key={r.id} className="border-t border-slate-100/80 transition hover:bg-white"><td className="px-3 py-4.5 font-medium text-slate-800 sm:px-5">{r.asset_name}</td><td className="px-3 py-4.5 sm:px-5"><span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-wide ${categoryMeta[r.category].badgeClass}`}>{categoryMeta[r.category].badge}</span></td><td className="px-3 py-4.5 text-slate-700 sm:px-5">{thb.format(r.effectiveCurrentValue)}</td><td className={`px-3 py-4.5 font-medium sm:px-5 ${financialColorClass(r.category === 'receivable' ? 0 : r.profit_loss)}`}>{r.category === 'receivable' ? <span className="text-amber-600">รอรับคืน</span> : thb.format(r.profit_loss)}</td><td className={`px-3 py-4.5 font-semibold sm:px-5 ${r.category === 'receivable' ? 'text-amber-600' : financialColorClass(r.return_percent)}`}>{r.category === 'receivable' ? <span>รอชำระคืน</span> : `${r.return_percent >= 0 ? '+' : ''}${r.return_percent.toFixed(2)}%`}</td><td className="px-3 py-4.5 sm:px-5"><div className="flex items-center gap-3 whitespace-nowrap text-sm"><button onClick={() => onEdit(r)} className="rounded-md px-1.5 py-0.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700">แก้ไข</button><button onClick={() => onDelete(r.id)} className="rounded-md px-1.5 py-0.5 text-rose-500 hover:bg-rose-50 hover:text-rose-600">ลบ</button></div></td></tr>)}</tbody></table></div>
    <button onClick={onCreate} className="mt-5 flex w-full items-center justify-center rounded-xl border border-dashed border-slate-300 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50">+ เพิ่มสินทรัพย์ใหม่</button>
  </section>;
}

function AssetGrowthTimeline({ rows, snapshots, onOpenSnapshot }: { rows: GrowthAssetRow[]; snapshots: AssetMonthlySnapshotRow[]; onOpenSnapshot: () => void }) {
  const sortedSnapshots = useMemo(() => sortAssetSnapshotsByMonth(snapshots), [snapshots]);
  const latest = getLatestAssetSnapshot(snapshots);
  const latestIndex = latest ? sortedSnapshots.findIndex((snapshot) => snapshot.id === latest.id) : -1;
  const previous = latestIndex > 0 ? sortedSnapshots[latestIndex - 1] : null;
  const delta = latest && previous ? Number(latest.total_value) - Number(previous.total_value) : 0;
  const deltaPct = previous && Number(previous.total_value) > 0 ? (delta / Number(previous.total_value)) * 100 : 0;
  const chartData = sortedSnapshots.map((snapshot) => ({
    month: chartMonth(snapshot.snapshot_month),
    monthFull: displaySnapshotMonth(snapshot.snapshot_month),
    total: Number(snapshot.total_value)
  }));

  return <section className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-[0_20px_45px_-30px_rgba(15,23,42,0.24)] md:p-6 lg:p-7">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div><p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Monthly Asset Snapshot</p><h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Asset Growth Timeline</h2><p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-500">ติดตามการเติบโตของสินทรัพย์รายเดือน เริ่มจากยอดตั้งต้นเดือนพฤษภาคม และเปรียบเทียบกับเดือนถัดไป</p></div>
      <button onClick={onOpenSnapshot} className="rounded-2xl bg-[#12233f] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_14px_30px_-20px_rgba(15,23,42,0.75)]">{snapshots.length ? 'อัปเดตประจำเดือน' : 'สร้าง Snapshot เดือนแรก'}</button>
    </div>

    {snapshots.length === 0 ? <div className="mt-6 rounded-[24px] border border-dashed border-slate-300 bg-slate-50/80 p-8 text-center"><p className="text-lg font-semibold text-slate-900">ยังไม่มีประวัติสินทรัพย์</p><p className="mt-2 text-sm text-slate-500">เริ่มบันทึกเดือนแรกเพื่อดูกราฟการเติบโตของสินทรัพย์</p><button onClick={onOpenSnapshot} className="mt-5 rounded-2xl bg-[#12233f] px-5 py-2.5 text-sm font-semibold text-white">สร้าง Snapshot เดือนแรก</button></div> : <>
      <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-4">
        <SummaryCard label="สินทรัพย์ทั้งหมด เดือนล่าสุด" value={thb.format(Number(latest?.total_value ?? 0))} />
        <SummaryCard label="เพิ่ม/ลดจากเดือนก่อน" value={thb.format(delta)} cls={financialColorClass(delta)} />
        <SummaryCard label="เปอร์เซ็นต์เปลี่ยนแปลง" value={`${delta >= 0 ? '+' : ''}${deltaPct.toFixed(2)}%`} cls={financialColorClass(deltaPct)} />
        <SummaryCard label="เดือนล่าสุดที่อัปเดต" value={latest ? displaySnapshotMonth(latest.snapshot_month) : '-'} />
      </div>
      <div className="mt-6 w-full">
        <ChartShell title="การเติบโตสินทรัพย์รวม" description="มูลค่าสินทรัพย์รวมรายเดือน"><ResponsiveContainer width="100%" height="100%"><LineChart data={chartData} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" /><XAxis dataKey="month" tickLine={false} axisLine={false} /><YAxis tickLine={false} axisLine={false} width={74} tickFormatter={(value) => compactThb(Number(value))} /><Tooltip formatter={(value: number) => thb.format(value)} labelFormatter={(_, payload) => payload?.[0]?.payload?.monthFull ?? ''} contentStyle={{ borderRadius: 16, border: '1px solid #E2E8F0' }} /><Line type="monotone" dataKey="total" name="สินทรัพย์ทั้งหมด" stroke="#0F766E" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} /></LineChart></ResponsiveContainer></ChartShell>
      </div>
    </>}
    {rows.length === 0 ? <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700">เพิ่มสินทรัพย์ในตารางสินทรัพย์ก่อน เพื่อให้ฟอร์ม Snapshot มีรายการให้กรอก</p> : null}
  </section>;
}

function AssetSnapshotForm({ assets, snapshots, onClose, onSubmit }: { assets: GrowthAssetRow[]; snapshots: AssetMonthlySnapshotRow[]; onClose: () => void; onSubmit: (fd: FormData) => Promise<{ success: boolean; message: string }> }) {
  const [month, setMonth] = useState(monthInputValue());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const selectedSnapshot = snapshots.find((snapshot) => snapshot.snapshot_month.startsWith(month));
  const rows = assets.map((asset) => {
    const snapshotItem = selectedSnapshot?.items.find((item) => item.asset_id === asset.id);
    const currentValue = asset.asset_type === 'receivable' ? asset.invested_amount : asset.current_value;
    return { ...asset, snapshotValue: String(snapshotItem?.value ?? currentValue ?? 0) };
  });

  const submitSnapshot = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting || rows.length === 0) return;

    let overwriteConfirmed = false;
    if (selectedSnapshot) {
      overwriteConfirmed = window.confirm(`มี Snapshot ของเดือน ${displaySnapshotMonth(selectedSnapshot.snapshot_month)} อยู่แล้ว ต้องการเขียนทับข้อมูลของเดือนนี้หรือไม่?`);
      if (!overwriteConfirmed) return;
    }

    setIsSubmitting(true);
    setMessage(null);
    try {
      const formData = new FormData(event.currentTarget);
      formData.set('snapshot_month', month);
      formData.set('overwrite_confirmed', String(overwriteConfirmed));
      const result = await onSubmit(formData);
      if (!result.success) setMessage(result.message);
    } catch {
      setMessage('บันทึก Snapshot ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  return <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-900/55 px-4 pb-10 pt-[72px] backdrop-blur-sm md:pt-24">
    <div className="flex min-h-full items-start justify-center">
      <form onSubmit={submitSnapshot} className="relative z-[101] flex max-h-[calc(100vh-140px)] w-full max-w-3xl flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-slate-100 bg-white px-5 py-5 sm:px-6"><div><h3 className="text-xl font-semibold text-slate-900">{selectedSnapshot ? 'แก้ไข Snapshot รายเดือน' : 'สร้าง Snapshot รายเดือน'}</h3><p className="mt-1 text-sm text-slate-500">หนึ่งเดือนมี Snapshot ได้ 1 ชุด หากเลือกเดือนเดิมระบบจะแก้ไขข้อมูลเดิม</p></div><button type="button" onClick={onClose} className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-500 transition hover:bg-slate-200 hover:text-slate-700">ปิด</button></div>
        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          <label className="block text-sm font-medium text-slate-700">เดือน/ปี</label><input className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-slate-400 focus:outline-none" type="month" value={month} onChange={(event) => setMonth(event.target.value)} required />
          <div className="mt-5 space-y-3">{rows.map((asset) => <div key={`${month}-${asset.id}`} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3 sm:grid sm:grid-cols-[1fr_170px] sm:items-center sm:gap-3"><div><p className="font-medium text-slate-900">{asset.asset_name}</p><p className="mt-1 text-xs text-slate-500">{categoryMeta[asset.asset_type].label}</p><input type="hidden" name="asset_id" value={asset.id} /></div><label className="mt-3 block sm:mt-0"><span className="text-xs font-medium text-slate-500">มูลค่าปัจจุบัน</span><input className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-right text-slate-900 focus:border-slate-400 focus:outline-none" type="number" min="0" step="0.01" name="value" defaultValue={asset.snapshotValue} required /></label></div>)}</div>
          {rows.length === 0 ? <div className="mt-5 rounded-2xl border border-dashed p-6 text-center text-sm text-slate-500">ยังไม่มีสินทรัพย์ในตารางปัจจุบัน</div> : null}
          {message ? <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{message}</p> : null}
        </div>
        <div className="sticky bottom-0 z-10 flex flex-col gap-2 border-t border-slate-200 bg-white px-5 py-4 sm:flex-row sm:px-6"><button type="submit" disabled={rows.length === 0 || isSubmitting} className="h-12 w-full rounded-2xl bg-[color:var(--accent-blue)] px-4 text-sm font-semibold text-[#FFFFFF] shadow-[0_14px_28px_-18px_rgba(37,99,235,0.85)] transition-colors hover:bg-blue-700 hover:text-[#FFFFFF] active:text-[#FFFFFF] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-[#FFFFFF] disabled:shadow-none sm:flex-1">{isSubmitting ? 'กำลังบันทึก...' : 'บันทึก Snapshot'}</button><button type="button" disabled={isSubmitting} onClick={onClose} className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto">ยกเลิก</button></div>
      </form>
    </div>
  </div>;
}

function SummaryCard({ label, value, cls = 'text-slate-900' }: { label: string; value: string; cls?: string }) { return <article className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_16px_36px_-28px_rgba(15,23,42,0.45)]"><p className="text-xs font-normal uppercase tracking-wide text-slate-500">{label}</p><p className={`font-numeric mt-2 text-2xl tracking-tight ${cls}`}>{value}</p></article>; }
function ChartShell({ title, description, children }: { title: string; description: string; children: React.ReactNode }) { return <article className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-4 shadow-[0_16px_34px_-30px_rgba(15,23,42,0.45)]"><div><h3 className="text-lg font-semibold text-slate-900">{title}</h3><p className="text-sm text-slate-500">{description}</p></div><div className="mt-4 h-72 w-full sm:h-80">{children}</div></article>; }

function MoneyForm({ row, onClose, onSubmit }: { row: MoneyIncomeSourceRow | null; onClose: () => void; onSubmit: (fd: FormData) => void }) {
  const [name, setName] = useState(row?.name ?? ''); const [description, setDescription] = useState(row?.description ?? ''); const [income, setIncome] = useState(row ? String(row.income_amount) : ''); const [expense, setExpense] = useState(row ? String(row.expense_amount) : ''); const [note, setNote] = useState(row?.expense_note ?? '');
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"><form action={(fd) => { if (row) fd.set('id', row.id); fd.set('name', name); fd.set('description', description); fd.set('income_amount', income); fd.set('expense_amount', expense); fd.set('expense_note', note); onSubmit(fd); }} className="w-full max-w-lg space-y-3 rounded-2xl bg-white p-5"><h3 className="text-lg font-semibold">{row ? 'แก้ไขแหล่งรายได้' : 'เพิ่มแหล่งรายได้'}</h3><input className="theme-input" placeholder="ชื่อแหล่งรายได้" value={name} onChange={(e) => setName(e.target.value)} required /><textarea className="theme-input" placeholder="คำอธิบาย" value={description} onChange={(e) => setDescription(e.target.value)} /><input className="theme-input" type="number" min="0" placeholder="รายได้" value={income} onChange={(e) => setIncome(e.target.value)} /><input className="theme-input" type="number" min="0" placeholder="ค่าใช้จ่าย" value={expense} onChange={(e) => setExpense(e.target.value)} /><input className="theme-input" placeholder="รายละเอียดค่าใช้จ่าย" value={note} onChange={(e) => setNote(e.target.value)} /><div className="flex gap-2"><button className="theme-button-primary">บันทึก</button><button type="button" onClick={onClose} className="theme-button-secondary">ยกเลิก</button></div></form></div>;
}

function GrowthAssetForm({ row, onClose, onSubmit }: { row: GrowthAssetRow | null; onClose: () => void; onSubmit: (fd: FormData) => void }) {
  const [assetName, setAssetName] = useState(row?.asset_name ?? '');
  const [assetType, setAssetType] = useState<GrowthAssetType>(row?.asset_type ?? 'investment');
  const [investedAmount, setInvestedAmount] = useState(row ? String(row.invested_amount) : '');
  const [currentValue, setCurrentValue] = useState(row ? String(row.current_value) : '');

  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-[1px]"><form action={(fd) => { if (row) fd.set('id', row.id); fd.set('asset_name', assetName); fd.set('asset_type', assetType); fd.set('invested_amount', investedAmount); fd.set('current_value', currentValue); onSubmit(fd); }} className="w-full max-w-lg space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
    <h3 className="text-lg font-semibold text-slate-900">{row ? 'แก้ไขสินทรัพย์' : 'เพิ่มสินทรัพย์ใหม่'}</h3>
    <input className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none" placeholder="ชื่อสินทรัพย์" value={assetName} onChange={(e) => setAssetName(e.target.value)} required />
    <select className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-slate-400 focus:outline-none" value={assetType} onChange={(e) => setAssetType(e.target.value as GrowthAssetType)}><option value="investment">การลงทุน</option><option value="safe">เงินสำรอง</option><option value="future">เงินอนาคต</option><option value="receivable">เงินรอรับ</option></select>
    <input className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none" type="number" min="0" step="0.01" placeholder="เงินต้น" value={investedAmount} onChange={(e) => setInvestedAmount(e.target.value)} required />
    <input className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none" type="number" min="0" step="0.01" placeholder="มูลค่าปัจจุบัน" value={currentValue} onChange={(e) => setCurrentValue(e.target.value)} required />
    <div className="flex gap-2"><button className="theme-button-primary">บันทึก</button><button type="button" onClick={onClose} className="theme-button-secondary">ยกเลิก</button></div>
  </form></div>;
}


