'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { deleteGrowthAssetAction, deleteMoneyIncomeSourceAction, saveAssetMonthlySnapshotAction, upsertGrowthAssetAction, upsertMoneyIncomeSourceAction } from '@/app/money-management/actions';
import { AssetMonthlySnapshotRow, GrowthAssetRow, GrowthAssetType, MoneyManagementPageData, MoneyIncomeSourceRow, MoneySummary } from '@/lib/money/types';
import { RewardFormModal } from '@/components/rewards/RewardFormModal';
import { RewardPreviewCard } from '@/components/rewards/RewardPreviewCard';

const thb = new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 });
const enMonthLabel = new Intl.DateTimeFormat('th-TH', { month: 'long', year: 'numeric' });
const shortMonthLabel = new Intl.DateTimeFormat('th-TH', { month: 'short' });
const targetPassiveIncomeMonthly = 10_000;
const categoryMeta = {
  investment: { label: 'การลงทุน', badge: 'การลงทุน', color: '#2563EB', cardClass: 'border-blue-200 bg-blue-50 text-blue-700', badgeClass: 'bg-blue-100 text-blue-700', iconText: 'ล' },
  safe: { label: 'เงินสำรอง', badge: 'เงินสำรอง', color: '#0D9488', cardClass: 'border-teal-200 bg-teal-50 text-teal-700', badgeClass: 'bg-teal-100 text-teal-700', iconText: 'ส' },
  future: { label: 'เงินอนาคต', badge: 'เงินอนาคต', color: '#7C3AED', cardClass: 'border-violet-200 bg-violet-50 text-violet-700', badgeClass: 'bg-violet-100 text-violet-700', iconText: 'อ' },
  receivable: { label: 'เงินรอรับ', badge: 'เงินรอรับ', color: '#D97706', cardClass: 'border-amber-200 bg-amber-50 text-amber-700', badgeClass: 'bg-amber-100 text-amber-700', iconText: 'ร' },
} as const;
type AssetCategory = keyof typeof categoryMeta;
const assetCategories = Object.keys(categoryMeta) as AssetCategory[];
const incomeBreakdownColors = ['#2563EB', '#0D9488', '#7C3AED', '#059669', '#E11D48', '#475569'];

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

export function SimpleMoneyManagement({ data }: { data: MoneyManagementPageData }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [editing, setEditing] = useState<MoneyIncomeSourceRow | null>(null);
  const [open, setOpen] = useState(false);
  const [growthOpen, setGrowthOpen] = useState(false);
  const [growthEditing, setGrowthEditing] = useState<GrowthAssetRow | null>(null);
  const [snapshotOpen, setSnapshotOpen] = useState(false);
  const [moneyRewardOpen, setMoneyRewardOpen] = useState(false);
  const [moneyReward, setMoneyReward] = useState({
    title: 'Las Vegas Trip',
    description: 'ปลดล็อกเมื่อสร้าง Passive Income เพิ่มครบ +฿10,000/เดือน',
    imageUrl: ''
  });

  const rows = useMemo(() => data.incomeSources ?? [], [data.incomeSources]);
  const growthRows = useMemo(() => data.growthAssets ?? [], [data.growthAssets]);
  const snapshots = useMemo(() => data.assetSnapshots ?? [], [data.assetSnapshots]);
  const currentPassiveIncomeMonthly = 0;
  const progressPercent = Math.min((currentPassiveIncomeMonthly / targetPassiveIncomeMonthly) * 100, 100);
  const onDelete = (id: string) => startTransition(async () => {
    const result = await deleteMoneyIncomeSourceAction(id);
    if (!result.success) return;
    setOpen(false);
    setEditing(null);
    router.refresh();
  });

  const openCreate = () => { setEditing(null); setOpen(true); };
  const openEdit = (row: MoneyIncomeSourceRow) => { setEditing(row); setOpen(true); };
  const latestSnapshot = getLatestAssetSnapshot(snapshots);
  const sortedSnapshots = useMemo(() => sortAssetSnapshotsByMonth(snapshots), [snapshots]);
  const latestSnapshotIndex = latestSnapshot ? sortedSnapshots.findIndex((snapshot) => snapshot.id === latestSnapshot.id) : -1;
  const previousSnapshot = latestSnapshotIndex > 0 ? sortedSnapshots[latestSnapshotIndex - 1] : null;
  const latestAssetValue = Number(latestSnapshot?.total_value ?? 0);
  const previousAssetValue = Number(previousSnapshot?.total_value ?? 0);
  const assetGrowth = previousSnapshot ? latestAssetValue - previousAssetValue : data.growthSummary.totalProfitLoss;
  const assetGrowthPct = previousAssetValue > 0 ? (assetGrowth / previousAssetValue) * 100 : 0;

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

  return <div className="mx-auto w-full max-w-7xl space-y-8 px-4 pb-8 pt-7 md:px-8">
    <section className="relative overflow-hidden rounded-[20px] border border-slate-200/80 bg-white p-6 shadow-[0_24px_64px_-42px_rgba(15,23,42,0.36)] md:p-8">
      <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-blue-100/70 blur-3xl" />
      <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-[13px] text-blue-600">ศูนย์ควบคุมการเงิน</p>
          <h1 className="mt-3 text-[32px] font-bold leading-tight text-slate-950">การเงิน</h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-7 text-slate-600">ติดตามสินทรัพย์ รายได้ รายได้ทางอ้อม และการเติบโตของมูลค่าสุทธิในที่เดียว</p>
        </div>
        <button onClick={() => setSnapshotOpen(true)} className="theme-button-primary w-full !text-[#FFFFFF] sm:w-auto" style={{ color: '#FFFFFF' }}>อัปเดตมูลค่าสุทธิ</button>
      </div>
      <div className="relative mt-8 grid grid-cols-1 gap-3 md:grid-cols-3">
        <WealthMetric label="สินทรัพย์ทั้งหมด" value={thb.format(latestAssetValue)} highlight />
        <WealthMetric label="รายได้สุทธิ" value={thb.format(data.summary.netIncome)} />
        <WealthMetric label="การเติบโตมูลค่าสุทธิ" value={`${assetGrowth >= 0 ? '+' : ''}${thb.format(assetGrowth)}${previousSnapshot ? ` (${assetGrowthPct.toFixed(1)}%)` : ''}`} tone={assetGrowth >= 0 ? 'success' : 'danger'} />
      </div>
    </section>
    <section className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-[0_20px_45px_-30px_rgba(15,23,42,0.24)] md:p-6">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-slate-900">ภารกิจการเงินประจำปี</h2>
        <p className="text-sm text-slate-500">เป้าหมายหลักของปีนี้: สร้าง Passive Income เพิ่ม และให้รางวัลตัวเองเมื่อทำสำเร็จ</p>
      </div>
      <div className="mt-5 grid grid-cols-1 gap-4">
        <AnnualGoalCard currentPassiveIncomeMonthly={currentPassiveIncomeMonthly} progressPercent={progressPercent} />
      </div>
      <div className="mt-5">
        <h3 className="text-sm font-semibold text-slate-900">รางวัลภารกิจ</h3>
        <RewardPreviewCard
          missionTitle="ภารกิจการเงินประจำปี"
          emptyTitle="รางวัลภารกิจ"
          emptyDescription="ตั้งรางวัลให้ภารกิจนี้ เพื่อเพิ่มแรงจูงใจในการทำให้สำเร็จ"
          lockedCta="ปลดล็อกเมื่อสร้าง Passive Income เพิ่มครบ +฿10,000/เดือน"
          reward={{
            title: moneyReward.title,
            description: moneyReward.description,
            imageUrl: moneyReward.imageUrl,
            status: null
          }}
          isMissionCompleted={progressPercent >= 100}
          onAddReward={() => setMoneyRewardOpen(true)}
          improveLockedContrast
          preserveImageAspectRatio
        />
      </div>
    </section>

    <div className="grid grid-cols-1 items-start gap-5 md:grid-cols-[40%_60%] md:gap-6 lg:grid-cols-[35%_65%] lg:gap-7">
      <div className="space-y-5">
        <IncomeSourcesCard rows={rows} onCreate={openCreate} onEdit={openEdit} onDelete={onDelete} />
        <MonthlyIncomeOverviewCard rows={rows} summary={data.summary} />
      </div>
      <GrowthAssetsCard rows={growthRows} totalValue={data.growthSummary.totalValue} totalProfitLoss={data.growthSummary.totalProfitLoss} onCreate={() => { setGrowthEditing(null); setGrowthOpen(true); }} onEdit={(row) => { setGrowthEditing(row); setGrowthOpen(true); }} onDelete={(id) => startTransition(async () => { const res = await deleteGrowthAssetAction(id); if (res.success) router.refresh(); })} />
    </div>

    <AssetGrowthTimeline rows={growthRows} snapshots={snapshots} onOpenSnapshot={() => setSnapshotOpen(true)} />

    <section className="group relative overflow-hidden rounded-[24px] border border-amber-200/80 bg-gradient-to-br from-[#FFF6DF] via-[#F9E8C5] to-[#F3D59A] p-4 shadow-[0_18px_36px_-28px_rgba(120,86,20,0.45)] md:p-5">
      <div className="pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full bg-amber-200/35 blur-2xl transition-opacity duration-300 group-hover:opacity-90" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.45),transparent_45%,rgba(196,142,55,0.06))]" />
      <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 md:flex-1"><p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-700/70">โฟกัสระยะยาว</p><h2 className="mt-1 text-xl font-semibold tracking-tight text-amber-950 md:text-2xl">แหล่งรายได้ถัดไป</h2><p className="mt-1 text-xs text-amber-900/70 md:text-sm">สร้างแหล่งรายได้ใหม่เพื่อรองรับภารกิจธุรกิจในอนาคต</p></div>
        <div className="hidden h-12 w-px bg-gradient-to-b from-transparent via-amber-300/80 to-transparent md:block" />
        <div className="grid flex-1 gap-2 text-sm text-slate-700 md:max-w-[340px]"><p><span className="font-medium text-amber-900">โหมดปัจจุบัน:</span> สำรวจโอกาส</p><p><span className="font-medium text-amber-900">โฟกัส:</span> แหล่งรายได้ใหม่</p></div>
        <article className="relative overflow-hidden rounded-xl border border-amber-300/70 bg-gradient-to-br from-[#FFF7E2] to-[#F8E4BF] px-3.5 py-3 shadow-[0_12px_22px_-20px_rgba(120,86,20,0.45)] md:min-w-[210px]"><div className="relative"><div className="flex items-center justify-between gap-2"><p className="text-xs font-semibold !text-[#1F2937]">🎰 รางวัลลาสเวกัส</p><span className="rounded-full border border-amber-400/70 bg-amber-100/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide !text-[#374151]">ยังล็อกอยู่</span></div><p className="mt-2 text-[11px] font-medium uppercase tracking-wide !text-[#4B5563]">ปลดล็อกเมื่อถึง</p><p className="text-sm font-semibold !text-[#111827]">฿100,000/เดือน</p></div></article>
      </div>
    </section>

    {open ? <MoneyForm row={editing} onClose={() => setOpen(false)} onSubmit={(fd) => startTransition(async () => { const res = await upsertMoneyIncomeSourceAction(fd); if (res.success) { setOpen(false); router.refresh(); } })} /> : null}
    {growthOpen ? <GrowthAssetForm row={growthEditing} onClose={() => setGrowthOpen(false)} onSubmit={(fd) => startTransition(async () => { const res = await upsertGrowthAssetAction(fd); if (res.success) { setGrowthOpen(false); setGrowthEditing(null); router.refresh(); } })} /> : null}
    {snapshotOpen ? <AssetSnapshotForm assets={growthRows} snapshots={snapshots} onClose={() => setSnapshotOpen(false)} onSubmit={(fd) => startTransition(async () => { const res = await saveAssetMonthlySnapshotAction(fd); if (res.success) { setSnapshotOpen(false); router.refresh(); } })} /> : null}
    <RewardFormModal
      open={moneyRewardOpen}
      levelId="money-management-annual-reward"
      defaultValues={{
        title: moneyReward.title,
        description: moneyReward.description,
        emotionalCopy: moneyReward.description,
        imageUrl: moneyReward.imageUrl
      }}
      onClose={() => setMoneyRewardOpen(false)}
      onSubmit={(fd) => {
        setMoneyReward((current) => ({
          ...current,
          title: String(fd.get('title') ?? current.title),
          description: String(fd.get('description') ?? current.description),
          imageUrl: String(fd.get('image_url') ?? current.imageUrl)
        }));
        setMoneyRewardOpen(false);
      }}
    />
  </div>;
}

function IncomeSourcesCard({ rows, onCreate, onEdit, onDelete }: { rows: MoneyIncomeSourceRow[]; onCreate: () => void; onEdit: (row: MoneyIncomeSourceRow) => void; onDelete: (id: string) => void }) {
  return <section className="rounded-2xl bg-white p-4 shadow-sm md:p-4.5 lg:p-5">
    <div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-semibold text-slate-800 lg:text-xl">รายได้ของฉัน</h2><button onClick={onCreate} className="rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white sm:px-4 sm:py-2 sm:text-sm">+ เพิ่มแหล่งรายได้</button></div>
    {rows.length === 0 ? <div className="rounded-2xl border border-dashed p-6 text-center text-slate-500">ยังไม่มีแหล่งรายได้ กด “เพิ่มแหล่งรายได้” เพื่อเริ่มต้น</div> : <>
      <div className="hidden overflow-x-auto md:block"><table className="w-full text-xs lg:text-sm"><thead className="text-left text-slate-500"><tr><th className="py-2.5">แหล่งรายได้</th><th className="py-2.5">รายได้</th><th className="py-2.5">ค่าใช้จ่าย</th><th className="py-2.5">คงเหลือ</th><th className="py-2.5"></th></tr></thead><tbody>{rows.map((r) => <tr key={r.id} className="border-t"><td className="py-2.5"><p className="font-medium text-slate-800">{r.name}</p><p className="text-[11px] text-slate-500 lg:text-xs">{r.description ?? '-'}</p></td><td className="py-2.5 text-emerald-600">{thb.format(r.income_amount)}</td><td className="py-2.5 text-rose-600">{thb.format(r.expense_amount)} <span className="text-[10px] text-slate-500 lg:text-xs">{r.expense_note ? `(${r.expense_note})` : ''}</span></td><td className="py-2.5 font-semibold text-emerald-600">{thb.format(r.income_amount - r.expense_amount)}</td><td className="py-2.5"><div className="flex gap-2"><button onClick={() => onEdit(r)} className="text-slate-600">แก้ไข</button><button onClick={() => onDelete(r.id)} className="text-rose-600">ลบ</button></div></td></tr>)}</tbody></table></div>
      <div className="space-y-3 md:hidden">{rows.map((r) => <div key={r.id} className="rounded-xl border p-3"><p className="font-semibold">{r.name}</p><p className="text-sm text-slate-500">{r.description}</p><p className="text-sm text-emerald-600">รายได้ {thb.format(r.income_amount)}</p><p className="text-sm text-rose-600">ค่าใช้จ่าย {thb.format(r.expense_amount)}</p><p className="text-sm font-semibold text-emerald-600">คงเหลือ {thb.format(r.income_amount - r.expense_amount)}</p><div className="mt-2 flex gap-3"><button onClick={() => onEdit(r)}>แก้ไข</button><button onClick={() => onDelete(r.id)} className="text-rose-600">ลบ</button></div></div>)}</div>
    </>}
    <button onClick={onCreate} className="mt-3 flex w-full items-center gap-2.5 rounded-xl border border-dashed p-3 text-left"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100">+</span><span><p className="text-sm font-medium text-slate-700">เพิ่มแหล่งรายได้ใหม่</p><p className="text-xs text-slate-500">เพิ่มแหล่งรายได้</p></span></button>
  </section>;
}

function WealthMetric({ label, value, highlight = false, tone = 'default' }: { label: string; value: string; highlight?: boolean; tone?: 'default' | 'success' | 'danger' }) {
  const toneClass = tone === 'success' ? 'text-emerald-600' : tone === 'danger' ? 'text-rose-600' : highlight ? 'text-blue-600' : 'text-slate-950';
  return <article className="rounded-[20px] border border-slate-200/80 bg-slate-50/80 p-4">
    <p className="text-[13px] text-slate-500">{label}</p>
    <p className={`font-numeric mt-3 break-words text-2xl leading-tight tabular-nums ${toneClass}`}>{value}</p>
  </article>;
}


function MonthlyIncomeOverviewCard({ rows, summary }: { rows: MoneyIncomeSourceRow[]; summary: MoneySummary }) {
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

  return <section className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-[0_20px_45px_-30px_rgba(15,23,42,0.24)] md:p-6">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">ภาพรวมรายเดือน</p>
        <h2 className="mt-1 text-xl font-semibold text-slate-900">ภาพรวมรายได้ต่อเดือน</h2>
        <p className="mt-1 text-sm text-slate-500">ภาพรวมรายได้สุทธิและสัดส่วนแหล่งรายได้</p>
      </div>
      <span className="rounded-2xl bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">{activeRows.length} แหล่ง</span>
    </div>

    <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
      <IncomeOverviewMetric label="รายได้รวมต่อเดือน" value={thb.format(summary.grossIncome)} valueClass="text-slate-900" />
      <IncomeOverviewMetric label="ค่าใช้จ่าย/หักออกจากรายได้" value={thb.format(summary.totalExpense)} valueClass="text-rose-600" />
      <IncomeOverviewMetric label="รายได้สุทธิ" value={thb.format(summary.netIncome)} valueClass="text-emerald-600" />
      <IncomeOverviewMetric label="จำนวนแหล่งรายได้" value={`${activeRows.length} แหล่ง`} valueClass="text-slate-900" />
    </div>

    <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">แหล่งรายได้หลักที่มากที่สุด</p>
          <p className="mt-1 text-sm text-slate-500">{largestIncomeSource?.name ?? 'ยังไม่มีข้อมูลรายได้'}</p>
        </div>
        <p className="text-right text-lg font-semibold text-slate-900">{thb.format(Number(largestIncomeSource?.income_amount ?? 0))}</p>
      </div>
    </div>

    <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[150px_minmax(0,1fr)] lg:items-center">
      <div>
        <p className="text-sm font-semibold text-slate-900">สัดส่วนรายได้</p>
        <p className="mt-1 text-xs leading-relaxed text-slate-500">สัดส่วนรายได้แต่ละแหล่งในเดือนนี้</p>
      </div>
      {chartData.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-200 p-5 text-center text-sm text-slate-500">ยังไม่มีรายได้สำหรับแสดงกราฟ</div> : <div className="flex flex-col gap-5 rounded-2xl bg-white/70 p-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:p-4">
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
        <div className="min-w-[min(100%,20rem)] flex-1 space-y-3 sm:max-w-none">
          {chartData.map((item) => <div key={item.name} className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 border-0 text-sm no-underline decoration-transparent">
            <div className="flex min-w-0 items-start gap-2.5 border-0 no-underline decoration-transparent"><span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} /><span className="break-words text-sm leading-snug text-slate-700 no-underline decoration-transparent sm:text-base">{item.name}</span></div>
            <div className="shrink-0 text-right"><p className="font-semibold leading-tight text-slate-900">{compactThb(item.value)}</p><p className="mt-0.5 text-sm leading-tight text-slate-500">{item.pct.toFixed(1)}%</p></div>
          </div>)}
        </div>
      </div>}
    </div>
  </section>;
}

function IncomeOverviewMetric({ label, value, valueClass }: { label: string; value: string; valueClass: string }) {
  return <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-[0_10px_26px_-24px_rgba(15,23,42,0.45)]">
    <p className="text-xs font-medium text-slate-500">{label}</p>
    <p className={`mt-1 text-lg font-semibold tracking-tight ${valueClass}`}>{value}</p>
  </div>;
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
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">{assetCategories.map((key) => <div key={key} className={`rounded-2xl border px-4 py-3.5 ${categoryMeta[key].cardClass}`}><div className="flex items-center gap-2.5"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/75 text-[11px] font-semibold">{categoryMeta[key].iconText}</span><p className="text-xs font-medium">{categoryMeta[key].label}</p></div><p className="mt-2.5 text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">{thb.format(categorySummary[key])}</p><p className="mt-0.5 text-xs text-slate-500 sm:text-sm">{(adjustedTotalValue > 0 ? (categorySummary[key] / adjustedTotalValue) * 100 : 0).toFixed(2)}%</p></div>)}</div>
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
  const chartData = sortedSnapshots.map((snapshot) => {
    const categoryTotals = assetCategories.reduce((acc, key) => ({ ...acc, [key]: 0 }), {} as Record<AssetCategory, number>);
    snapshot.items.forEach((item) => { categoryTotals[item.asset_type] += Number(item.value); });
    return { month: chartMonth(snapshot.snapshot_month), monthFull: displaySnapshotMonth(snapshot.snapshot_month), total: Number(snapshot.total_value), ...categoryTotals };
  });

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
      <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-2">
        <ChartShell title="การเติบโตสินทรัพย์รวม" description="มูลค่าสินทรัพย์รวมรายเดือน"><ResponsiveContainer width="100%" height="100%"><LineChart data={chartData} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" /><XAxis dataKey="month" tickLine={false} axisLine={false} /><YAxis tickLine={false} axisLine={false} width={74} tickFormatter={(value) => compactThb(Number(value))} /><Tooltip formatter={(value: number) => thb.format(value)} labelFormatter={(_, payload) => payload?.[0]?.payload?.monthFull ?? ''} contentStyle={{ borderRadius: 16, border: '1px solid #E2E8F0' }} /><Line type="monotone" dataKey="total" name="สินทรัพย์ทั้งหมด" stroke="#0F766E" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} /></LineChart></ResponsiveContainer></ChartShell>
        <ChartShell title="สัดส่วนสินทรัพย์ตามหมวด" description="ดูว่าสัดส่วนแต่ละหมวดเพิ่มหรือลดในแต่ละเดือน"><ResponsiveContainer width="100%" height="100%"><BarChart data={chartData} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" /><XAxis dataKey="month" tickLine={false} axisLine={false} /><YAxis tickLine={false} axisLine={false} width={74} tickFormatter={(value) => compactThb(Number(value))} /><Tooltip formatter={(value: number) => thb.format(value)} labelFormatter={(_, payload) => payload?.[0]?.payload?.monthFull ?? ''} contentStyle={{ borderRadius: 16, border: '1px solid #E2E8F0' }} /><Legend iconType="circle" />{assetCategories.map((key) => <Bar key={key} dataKey={key} name={categoryMeta[key].label} stackId="assets" fill={categoryMeta[key].color} radius={[8, 8, 0, 0]} />)}</BarChart></ResponsiveContainer></ChartShell>
      </div>
    </>}
    {rows.length === 0 ? <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700">เพิ่มสินทรัพย์ในตารางสินทรัพย์ก่อน เพื่อให้ฟอร์ม Snapshot มีรายการให้กรอก</p> : null}
  </section>;
}

function AssetSnapshotForm({ assets, snapshots, onClose, onSubmit }: { assets: GrowthAssetRow[]; snapshots: AssetMonthlySnapshotRow[]; onClose: () => void; onSubmit: (fd: FormData) => void }) {
  const [month, setMonth] = useState(monthInputValue());
  const selectedSnapshot = snapshots.find((snapshot) => snapshot.snapshot_month.startsWith(month));
  const rows = assets.map((asset) => {
    const snapshotItem = selectedSnapshot?.items.find((item) => item.asset_id === asset.id || item.asset_name === asset.asset_name);
    return { ...asset, snapshotValue: String(snapshotItem?.value ?? asset.current_value ?? 0) };
  });

  return <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-900/55 px-4 pb-10 pt-[72px] backdrop-blur-sm md:pt-24">
    <div className="flex min-h-full items-start justify-center">
      <form action={(fd) => { fd.set('snapshot_month', month); onSubmit(fd); }} className="relative z-[101] flex max-h-[calc(100vh-140px)] w-full max-w-3xl flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-slate-100 bg-white px-5 py-5 sm:px-6"><div><h3 className="text-xl font-semibold text-slate-900">{selectedSnapshot ? 'แก้ไข Snapshot รายเดือน' : 'สร้าง Snapshot รายเดือน'}</h3><p className="mt-1 text-sm text-slate-500">หนึ่งเดือนมี Snapshot ได้ 1 ชุด หากเลือกเดือนเดิมระบบจะแก้ไขข้อมูลเดิม</p></div><button type="button" onClick={onClose} className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-500 transition hover:bg-slate-200 hover:text-slate-700">ปิด</button></div>
        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          <label className="block text-sm font-medium text-slate-700">เดือน/ปี</label><input className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-slate-400 focus:outline-none" type="month" value={month} onChange={(event) => setMonth(event.target.value)} required />
          <div className="mt-5 space-y-3">{rows.map((asset) => <div key={`${month}-${asset.id}`} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3 sm:grid sm:grid-cols-[1fr_170px] sm:items-center sm:gap-3"><div><p className="font-medium text-slate-900">{asset.asset_name}</p><p className="mt-1 text-xs text-slate-500">{categoryMeta[asset.asset_type].label}</p><input type="hidden" name="asset_id" value={asset.id} /><input type="hidden" name="asset_name" value={asset.asset_name} /><input type="hidden" name="asset_type" value={asset.asset_type} /></div><label className="mt-3 block sm:mt-0"><span className="text-xs font-medium text-slate-500">มูลค่าปัจจุบัน</span><input className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-right text-slate-900 focus:border-slate-400 focus:outline-none" type="number" min="0" step="0.01" name="value" defaultValue={asset.snapshotValue} required /></label></div>)}</div>
          {rows.length === 0 ? <div className="mt-5 rounded-2xl border border-dashed p-6 text-center text-sm text-slate-500">ยังไม่มีสินทรัพย์ในตารางปัจจุบัน</div> : null}
        </div>
        <div className="sticky bottom-0 z-10 flex flex-col gap-2 border-t border-slate-200 bg-white px-5 py-4 sm:flex-row sm:px-6"><button disabled={rows.length === 0} className="h-12 w-full rounded-2xl bg-[color:var(--accent-blue)] px-4 text-sm font-semibold text-[#FFFFFF] shadow-[0_14px_28px_-18px_rgba(37,99,235,0.85)] transition-colors hover:bg-blue-700 hover:text-[#FFFFFF] active:text-[#FFFFFF] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-[#FFFFFF] disabled:shadow-none sm:flex-1">บันทึก Snapshot</button><button type="button" onClick={onClose} className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 sm:w-auto">ยกเลิก</button></div>
      </form>
    </div>
  </div>;
}

function SummaryCard({ label, value, cls = 'text-slate-900' }: { label: string; value: string; cls?: string }) { return <article className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_16px_36px_-28px_rgba(15,23,42,0.45)]"><p className="text-xs font-normal uppercase tracking-wide text-slate-500">{label}</p><p className={`font-numeric mt-2 text-2xl tracking-tight ${cls}`}>{value}</p></article>; }
function ChartShell({ title, description, children }: { title: string; description: string; children: React.ReactNode }) { return <article className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-4 shadow-[0_16px_34px_-30px_rgba(15,23,42,0.45)]"><div><h3 className="text-lg font-semibold text-slate-900">{title}</h3><p className="text-sm text-slate-500">{description}</p></div><div className="mt-4 h-72 w-full sm:h-80">{children}</div></article>; }
function AnnualGoalCard({ currentPassiveIncomeMonthly, progressPercent }: { currentPassiveIncomeMonthly: number; progressPercent: number }) { return <article className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">เป้าหมายประจำปี</p><h3 className="mt-2 text-lg font-semibold text-slate-900">เป้าหมายประจำปี</h3><p className="mt-2 text-sm font-medium text-slate-800">สร้าง Passive Income เพิ่ม +฿10,000/เดือน</p><p className="mt-2 text-sm leading-relaxed text-slate-600">เพิ่มรายได้แบบไม่ต้องแลกเวลาด้วยงานประจำ เช่น บ้านเช่า การลงทุน หรือธุรกิจที่เริ่มสร้างกระแสเงินสดได้จริง</p><div className="mt-4 rounded-xl border border-slate-200 bg-white p-3"><div className="flex items-center justify-between text-sm"><span className="text-slate-500">เป้าหมาย</span><span className="font-semibold text-slate-800">+฿10,000 / เดือน</span></div><div className="mt-1.5 flex items-center justify-between text-sm"><span className="text-slate-500">ปัจจุบัน</span><span className="font-semibold text-emerald-600">{thb.format(currentPassiveIncomeMonthly)} / เดือน</span></div><div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${progressPercent}%` }} /></div><p className="mt-2 text-right text-xs font-medium text-slate-500">{progressPercent.toFixed(1)}%</p></div><p className="mt-4 rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-700">“ทุก +฿1,000/เดือน คืออิสรภาพที่เพิ่มขึ้นปีละ ฿12,000”</p></article>; }

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


