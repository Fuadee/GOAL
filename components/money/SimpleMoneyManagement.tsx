'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { deleteGrowthAssetAction, deleteMoneyIncomeSourceAction, saveAssetMonthlySnapshotAction, upsertGrowthAssetAction, upsertMoneyIncomeSourceAction } from '@/app/money-management/actions';
import { AssetMonthlySnapshotRow, GrowthAssetRow, GrowthAssetType, MoneyManagementPageData, MoneyIncomeSourceRow } from '@/lib/money/types';

const thb = new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 });
const monthLabel = new Intl.DateTimeFormat('th-TH-u-ca-buddhist', { month: 'long', year: 'numeric' }).format(new Date());
const enMonthLabel = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' });
const shortMonthLabel = new Intl.DateTimeFormat('en-US', { month: 'short' });
const targetPassiveIncomeMonthly = 10_000;
const categoryMeta = {
  investment: { label: 'Investment', badge: 'INVESTMENT', color: '#22C55E', cardClass: 'border-emerald-200/80 bg-emerald-50/70 text-emerald-700', badgeClass: 'bg-emerald-100/90 text-emerald-700', iconText: 'I' },
  safe: { label: 'Safe / Buffer', badge: 'SAFE / BUFFER', color: '#60A5FA', cardClass: 'border-blue-200/80 bg-blue-50/70 text-blue-700', badgeClass: 'bg-blue-100/90 text-blue-700', iconText: 'S' },
  future: { label: 'Future Fund', badge: 'FUTURE FUND', color: '#F59E0B', cardClass: 'border-amber-200/80 bg-amber-50/80 text-amber-700', badgeClass: 'bg-amber-100/90 text-amber-700', iconText: 'F' },
  receivable: { label: 'Receivable', badge: 'RECEIVABLE', color: '#A78BFA', cardClass: 'border-violet-200/80 bg-violet-50/70 text-violet-700', badgeClass: 'bg-violet-100/90 text-violet-700', iconText: 'R' },
} as const;
type AssetCategory = keyof typeof categoryMeta;
const assetCategories = Object.keys(categoryMeta) as AssetCategory[];

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

export function SimpleMoneyManagement({ data }: { data: MoneyManagementPageData }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [editing, setEditing] = useState<MoneyIncomeSourceRow | null>(null);
  const [open, setOpen] = useState(false);
  const [growthOpen, setGrowthOpen] = useState(false);
  const [growthEditing, setGrowthEditing] = useState<GrowthAssetRow | null>(null);
  const [snapshotOpen, setSnapshotOpen] = useState(false);

  const rows = useMemo(() => data.incomeSources ?? [], [data.incomeSources]);
  const growthRows = useMemo(() => data.growthAssets ?? [], [data.growthAssets]);
  const snapshots = useMemo(() => data.assetSnapshots ?? [], [data.assetSnapshots]);
  const currentPassiveIncomeMonthly = 0;
  const progressPercent = Math.min((currentPassiveIncomeMonthly / targetPassiveIncomeMonthly) * 100, 100);
  const rewardUnlocked = progressPercent >= 100;
  const onDelete = (id: string) => startTransition(async () => {
    const result = await deleteMoneyIncomeSourceAction(id);
    if (!result.success) return;
    setOpen(false);
    setEditing(null);
    router.refresh();
  });

  const openCreate = () => { setEditing(null); setOpen(true); };
  const openEdit = (row: MoneyIncomeSourceRow) => { setEditing(row); setOpen(true); };

  return <div className="mx-auto w-full max-w-[1440px] space-y-6 px-4 py-4 md:px-6">
    <section className="relative overflow-hidden rounded-[30px] border border-white/10 bg-gradient-to-br from-[#0B1733] via-[#13244A] to-[#0A1630] p-7 text-white shadow-[0_20px_45px_-26px_rgba(15,23,42,0.75)] backdrop-blur-sm md:p-8">
      <div className="pointer-events-none absolute -top-14 right-0 h-44 w-44 rounded-full bg-emerald-300/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 left-6 h-40 w-40 rounded-full bg-blue-300/10 blur-3xl" />
      <div className="relative flex items-start justify-between gap-3"><div><p className="text-sm text-slate-300">ภาพรวมการเงิน</p><p className="mt-2 text-4xl font-semibold tracking-tight text-emerald-300 md:text-5xl">{thb.format(data.summary.netIncome)}</p><p className="mt-1 text-sm text-slate-300">รายได้สุทธิ (คงเหลือ)</p></div><div className="rounded-2xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-slate-100 backdrop-blur">{monthLabel}</div></div>
      <div className="relative mt-7 grid grid-cols-1 gap-3 md:grid-cols-3"><Stat label="รายได้รวม" value={data.summary.grossIncome} cls="text-emerald-300" /><Stat label="ค่าใช้จ่ายรวม" value={data.summary.totalExpense} cls="text-rose-300" /><Stat label="รายได้สุทธิ (คงเหลือ)" value={data.summary.netIncome} cls="text-emerald-300" /></div>
    </section>

    <section className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-[0_20px_45px_-30px_rgba(15,23,42,0.24)] md:p-6">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-slate-900">Annual Money Mission</h2>
        <p className="text-sm text-slate-500">เป้าหมายหลักของปีนี้: สร้าง Passive Income เพิ่ม และให้รางวัลตัวเองเมื่อทำสำเร็จ</p>
      </div>
      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <AnnualGoalCard currentPassiveIncomeMonthly={currentPassiveIncomeMonthly} progressPercent={progressPercent} />
        <AnnualRewardCard rewardUnlocked={rewardUnlocked} progressPercent={progressPercent} />
      </div>
    </section>

    <div className="grid grid-cols-1 items-start gap-5 md:grid-cols-[40%_60%] md:gap-6 lg:grid-cols-[35%_65%] lg:gap-7">
      <IncomeSourcesCard rows={rows} onCreate={openCreate} onEdit={openEdit} onDelete={onDelete} />
      <GrowthAssetsCard rows={growthRows} totalValue={data.growthSummary.totalValue} totalProfitLoss={data.growthSummary.totalProfitLoss} onCreate={() => { setGrowthEditing(null); setGrowthOpen(true); }} onEdit={(row) => { setGrowthEditing(row); setGrowthOpen(true); }} onDelete={(id) => startTransition(async () => { const res = await deleteGrowthAssetAction(id); if (res.success) router.refresh(); })} />
    </div>

    <AssetGrowthTimeline rows={growthRows} snapshots={snapshots} onOpenSnapshot={() => setSnapshotOpen(true)} />

    <section className="group relative overflow-hidden rounded-[24px] border border-amber-200/80 bg-gradient-to-br from-[#FFF6DF] via-[#F9E8C5] to-[#F3D59A] p-4 shadow-[0_18px_36px_-28px_rgba(120,86,20,0.45)] md:p-5">
      <div className="pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full bg-amber-200/35 blur-2xl transition-opacity duration-300 group-hover:opacity-90" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.45),transparent_45%,rgba(196,142,55,0.06))]" />
      <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 md:flex-1"><p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-700/70">Long-Term Focus</p><h2 className="mt-1 text-xl font-semibold tracking-tight text-amber-950 md:text-2xl">Next Income Engine</h2><p className="mt-1 text-xs text-amber-900/70 md:text-sm">Build a new income source for future business mission.</p></div>
        <div className="hidden h-12 w-px bg-gradient-to-b from-transparent via-amber-300/80 to-transparent md:block" />
        <div className="grid flex-1 gap-2 text-sm text-slate-700 md:max-w-[340px]"><p><span className="font-medium text-amber-900">Current Mode:</span> Exploration</p><p><span className="font-medium text-amber-900">Focus:</span> New Income Source</p></div>
        <article className="relative overflow-hidden rounded-xl border border-amber-300/70 bg-gradient-to-br from-[#FFF7E2] to-[#F8E4BF] px-3.5 py-3 shadow-[0_12px_22px_-20px_rgba(120,86,20,0.45)] md:min-w-[210px]"><div className="relative"><div className="flex items-center justify-between gap-2"><p className="text-xs font-semibold text-amber-900">🎰 Las Vegas Reward</p><span className="rounded-full border border-amber-400/70 bg-amber-100/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800">Locked</span></div><p className="mt-2 text-[11px] font-medium uppercase tracking-wide text-amber-700/80">Unlock at</p><p className="text-sm font-semibold text-amber-950">฿100,000/month</p></div></article>
      </div>
    </section>

    {open ? <MoneyForm row={editing} onClose={() => setOpen(false)} onSubmit={(fd) => startTransition(async () => { const res = await upsertMoneyIncomeSourceAction(fd); if (res.success) { setOpen(false); router.refresh(); } })} /> : null}
    {growthOpen ? <GrowthAssetForm row={growthEditing} onClose={() => setGrowthOpen(false)} onSubmit={(fd) => startTransition(async () => { const res = await upsertGrowthAssetAction(fd); if (res.success) { setGrowthOpen(false); setGrowthEditing(null); router.refresh(); } })} /> : null}
    {snapshotOpen ? <AssetSnapshotForm assets={growthRows} snapshots={snapshots} onClose={() => setSnapshotOpen(false)} onSubmit={(fd) => startTransition(async () => { const res = await saveAssetMonthlySnapshotAction(fd); if (res.success) { setSnapshotOpen(false); router.refresh(); } })} /> : null}
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
      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 shadow-[0_12px_30px_-24px_rgba(15,23,42,0.55)] sm:p-5"><div><h3 className="text-base font-semibold text-slate-900">Portfolio Allocation</h3><p className="text-xs text-slate-500">สัดส่วนสินทรัพย์ตามหมวดหมู่</p></div><div className="mx-auto mt-3 h-44 w-full max-w-[230px] sm:h-48"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={chartDataWithPct} dataKey="value" nameKey="name" innerRadius={52} outerRadius={70} paddingAngle={2} stroke="none" onMouseLeave={() => setActiveSlice(null)}>{chartDataWithPct.map((item) => <Cell key={item.key} fill={item.color} fillOpacity={activeSlice ? (activeSlice === item.key ? 1 : 0.38) : 0.85} stroke={activeSlice === item.key ? '#334155' : 'none'} strokeWidth={activeSlice === item.key ? 1.5 : 0} onMouseEnter={() => setActiveSlice(item.key)} />)}</Pie><text x="50%" y="47%" textAnchor="middle" className="fill-slate-900 text-[18px] font-semibold">{compactThb(totalAssetValue)}</text><text x="50%" y="58%" textAnchor="middle" className="fill-slate-500 text-[11px]">Total Assets</text><Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid #E2E8F0' }} formatter={(value: number) => thb.format(value)} /></PieChart></ResponsiveContainer></div><div className="mt-2 border-t border-slate-200/90 pt-3"><p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Largest Allocation</p><p className="mt-1 text-sm font-semibold text-slate-800">{largestAllocation ? `${largestAllocation.name} • ${largestAllocation.pct.toFixed(2)}%` : '-'}</p></div></div>
    </div>
    <div className="mt-7 rounded-2xl bg-slate-50/70 max-lg:overflow-x-auto"><table className="w-full text-xs sm:text-sm max-lg:min-w-[620px]"><thead className="text-left text-slate-500"><tr><th className="px-3 py-3.5 sm:px-5">สินทรัพย์</th><th className="px-3 py-3.5 sm:px-5">ประเภท</th><th className="px-3 py-3.5 sm:px-5">มูลค่าปัจจุบัน</th><th className="px-3 py-3.5 sm:px-5">กำไร/ขาดทุน</th><th className="px-3 py-3.5 sm:px-5">ผลตอบแทน</th><th className="px-3 py-3.5 sm:px-5">จัดการ</th></tr></thead><tbody>{viewRows.map((r) => <tr key={r.id} className="border-t border-slate-100/80 transition hover:bg-white"><td className="px-3 py-4.5 font-medium text-slate-800 sm:px-5">{r.asset_name}</td><td className="px-3 py-4.5 sm:px-5"><span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-wide ${categoryMeta[r.category].badgeClass}`}>{categoryMeta[r.category].badge}</span></td><td className="px-3 py-4.5 text-slate-700 sm:px-5">{thb.format(r.effectiveCurrentValue)}</td><td className={`px-3 py-4.5 font-medium sm:px-5 ${financialColorClass(r.category === 'receivable' ? 0 : r.profit_loss)}`}>{r.category === 'receivable' ? <span className="text-amber-600">Pending Recovery</span> : thb.format(r.profit_loss)}</td><td className={`px-3 py-4.5 font-semibold sm:px-5 ${r.category === 'receivable' ? 'text-amber-600' : financialColorClass(r.return_percent)}`}>{r.category === 'receivable' ? <span>Awaiting repayment</span> : `${r.return_percent >= 0 ? '+' : ''}${r.return_percent.toFixed(2)}%`}</td><td className="px-3 py-4.5 sm:px-5"><div className="flex items-center gap-3 whitespace-nowrap text-sm"><button onClick={() => onEdit(r)} className="rounded-md px-1.5 py-0.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700">แก้ไข</button><button onClick={() => onDelete(r.id)} className="rounded-md px-1.5 py-0.5 text-rose-500 hover:bg-rose-50 hover:text-rose-600">ลบ</button></div></td></tr>)}</tbody></table></div>
    <button onClick={onCreate} className="mt-5 flex w-full items-center justify-center rounded-xl border border-dashed border-slate-300 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50">+ เพิ่มสินทรัพย์ใหม่</button>
  </section>;
}

function AssetGrowthTimeline({ rows, snapshots, onOpenSnapshot }: { rows: GrowthAssetRow[]; snapshots: AssetMonthlySnapshotRow[]; onOpenSnapshot: () => void }) {
  const latest = snapshots.at(-1);
  const previous = snapshots.at(-2);
  const delta = latest && previous ? Number(latest.total_value) - Number(previous.total_value) : 0;
  const deltaPct = previous && Number(previous.total_value) > 0 ? (delta / Number(previous.total_value)) * 100 : 0;
  const chartData = snapshots.map((snapshot) => {
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
        <SummaryCard label="Total Assets เดือนล่าสุด" value={thb.format(Number(latest?.total_value ?? 0))} />
        <SummaryCard label="เพิ่ม/ลดจากเดือนก่อน" value={thb.format(delta)} cls={financialColorClass(delta)} />
        <SummaryCard label="Change Percentage" value={`${delta >= 0 ? '+' : ''}${deltaPct.toFixed(2)}%`} cls={financialColorClass(deltaPct)} />
        <SummaryCard label="เดือนล่าสุดที่อัปเดต" value={latest ? displaySnapshotMonth(latest.snapshot_month) : '-'} />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-2">
        <ChartShell title="Total Asset Growth" description="มูลค่าสินทรัพย์รวมรายเดือน"><ResponsiveContainer width="100%" height="100%"><LineChart data={chartData} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" /><XAxis dataKey="month" tickLine={false} axisLine={false} /><YAxis tickLine={false} axisLine={false} width={74} tickFormatter={(value) => compactThb(Number(value))} /><Tooltip formatter={(value: number) => thb.format(value)} labelFormatter={(_, payload) => payload?.[0]?.payload?.monthFull ?? ''} contentStyle={{ borderRadius: 16, border: '1px solid #E2E8F0' }} /><Line type="monotone" dataKey="total" name="Total Assets" stroke="#0F766E" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} /></LineChart></ResponsiveContainer></ChartShell>
        <ChartShell title="Asset Category Breakdown" description="ดูว่าสัดส่วนแต่ละหมวดเพิ่มหรือลดในแต่ละเดือน"><ResponsiveContainer width="100%" height="100%"><BarChart data={chartData} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" /><XAxis dataKey="month" tickLine={false} axisLine={false} /><YAxis tickLine={false} axisLine={false} width={74} tickFormatter={(value) => compactThb(Number(value))} /><Tooltip formatter={(value: number) => thb.format(value)} labelFormatter={(_, payload) => payload?.[0]?.payload?.monthFull ?? ''} contentStyle={{ borderRadius: 16, border: '1px solid #E2E8F0' }} /><Legend iconType="circle" />{assetCategories.map((key) => <Bar key={key} dataKey={key} name={categoryMeta[key].label} stackId="assets" fill={categoryMeta[key].color} radius={[8, 8, 0, 0]} />)}</BarChart></ResponsiveContainer></ChartShell>
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

  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"><form action={(fd) => { fd.set('snapshot_month', month); onSubmit(fd); }} className="max-h-[92vh] w-full overflow-y-auto rounded-t-[28px] border border-slate-200 bg-white p-5 shadow-2xl sm:max-w-2xl sm:rounded-[28px] sm:p-6">
    <div className="flex items-start justify-between gap-3"><div><h3 className="text-xl font-semibold text-slate-900">{selectedSnapshot ? 'แก้ไข Snapshot รายเดือน' : 'สร้าง Snapshot รายเดือน'}</h3><p className="mt-1 text-sm text-slate-500">หนึ่งเดือนมี Snapshot ได้ 1 ชุด หากเลือกเดือนเดิมระบบจะแก้ไขข้อมูลเดิม</p></div><button type="button" onClick={onClose} className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-500">ปิด</button></div>
    <label className="mt-5 block text-sm font-medium text-slate-700">เดือน/ปี</label><input className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-slate-400 focus:outline-none" type="month" value={month} onChange={(event) => setMonth(event.target.value)} required />
    <div className="mt-5 space-y-3">{rows.map((asset) => <div key={`${month}-${asset.id}`} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3 sm:grid sm:grid-cols-[1fr_170px] sm:items-center sm:gap-3"><div><p className="font-medium text-slate-900">{asset.asset_name}</p><p className="mt-1 text-xs text-slate-500">{categoryMeta[asset.asset_type].label}</p><input type="hidden" name="asset_id" value={asset.id} /><input type="hidden" name="asset_name" value={asset.asset_name} /><input type="hidden" name="asset_type" value={asset.asset_type} /></div><label className="mt-3 block sm:mt-0"><span className="text-xs font-medium text-slate-500">Current Value</span><input className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-right text-slate-900 focus:border-slate-400 focus:outline-none" type="number" min="0" step="0.01" name="value" defaultValue={asset.snapshotValue} required /></label></div>)}</div>
    {rows.length === 0 ? <div className="mt-5 rounded-2xl border border-dashed p-6 text-center text-sm text-slate-500">ยังไม่มีสินทรัพย์ในตารางปัจจุบัน</div> : null}
    <div className="sticky bottom-0 -mx-5 mt-6 flex gap-2 border-t border-slate-200 bg-white px-5 pt-4 sm:-mx-6 sm:px-6"><button disabled={rows.length === 0} className="flex-1 rounded-2xl bg-[#12233f] px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300">Save Snapshot</button><button type="button" onClick={onClose} className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-600">ยกเลิก</button></div>
  </form></div>;
}

function SummaryCard({ label, value, cls = 'text-slate-900' }: { label: string; value: string; cls?: string }) { return <article className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_16px_36px_-28px_rgba(15,23,42,0.45)]"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p><p className={`mt-2 text-2xl font-bold tracking-tight ${cls}`}>{value}</p></article>; }
function ChartShell({ title, description, children }: { title: string; description: string; children: React.ReactNode }) { return <article className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-4 shadow-[0_16px_34px_-30px_rgba(15,23,42,0.45)]"><div><h3 className="text-lg font-semibold text-slate-900">{title}</h3><p className="text-sm text-slate-500">{description}</p></div><div className="mt-4 h-72 w-full sm:h-80">{children}</div></article>; }
function Stat({ label, value, cls }: { label: string; value: number; cls: string }) { return <div className="rounded-2xl border border-white/10 bg-white/10 p-4 shadow-inner backdrop-blur-sm"><p className="text-xs text-slate-300">{label}</p><p className={`mt-1 text-2xl font-semibold ${cls}`}>{thb.format(value)}</p></div>; }
function AnnualGoalCard({ currentPassiveIncomeMonthly, progressPercent }: { currentPassiveIncomeMonthly: number; progressPercent: number }) { return <article className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Annual Goal</p><h3 className="mt-2 text-lg font-semibold text-slate-900">เป้าหมายประจำปี</h3><p className="mt-2 text-sm font-medium text-slate-800">สร้าง Passive Income เพิ่ม +฿10,000/เดือน</p><p className="mt-2 text-sm leading-relaxed text-slate-600">เพิ่มรายได้แบบไม่ต้องแลกเวลาด้วยงานประจำ เช่น บ้านเช่า การลงทุน หรือธุรกิจที่เริ่มสร้างกระแสเงินสดได้จริง</p><div className="mt-4 rounded-xl border border-slate-200 bg-white p-3"><div className="flex items-center justify-between text-sm"><span className="text-slate-500">Target</span><span className="font-semibold text-slate-800">+฿10,000 / เดือน</span></div><div className="mt-1.5 flex items-center justify-between text-sm"><span className="text-slate-500">Current</span><span className="font-semibold text-emerald-600">{thb.format(currentPassiveIncomeMonthly)} / เดือน</span></div><div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${progressPercent}%` }} /></div><p className="mt-2 text-right text-xs font-medium text-slate-500">{progressPercent.toFixed(1)}%</p></div><p className="mt-4 rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-700">“ทุก +฿1,000/เดือน คืออิสรภาพที่เพิ่มขึ้นปีละ ฿12,000”</p></article>; }
function AnnualRewardCard({ rewardUnlocked, progressPercent }: { rewardUnlocked: boolean; progressPercent: number }) { return <article className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-indigo-50 via-sky-50 to-cyan-50 p-4 shadow-[0_16px_34px_-28px_rgba(15,23,42,0.45)] sm:p-5"><div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/40 blur-2xl" /><div className="relative"><div className="mb-2 flex items-center justify-between"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Annual Reward</p><span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${rewardUnlocked ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>{rewardUnlocked ? 'Unlocked' : 'Locked'}</span></div><h3 className="text-lg font-semibold text-slate-900">รางวัลเมื่อทำสำเร็จ</h3><p className="mt-2 text-sm font-medium text-slate-800">ทริป Las Vegas / รางวัลใหญ่ให้ตัวเอง</p><p className="mt-2 text-sm leading-relaxed text-slate-600">ปลดล็อกเมื่อ Passive Income เพิ่มขึ้นครบเป้าหมาย +฿10,000/เดือน</p><div className="mt-4 rounded-xl border border-white/80 bg-white/70 p-3"><div className="flex items-center justify-between text-sm"><span className="text-slate-500">Progress</span><span className="font-semibold text-slate-800">{progressPercent.toFixed(1)}%</span></div><div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-sky-500 transition-all" style={{ width: `${progressPercent}%` }} /></div></div></div></article>; }

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
    <select className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-slate-400 focus:outline-none" value={assetType} onChange={(e) => setAssetType(e.target.value as GrowthAssetType)}><option value="investment">Investment</option><option value="safe">Safe / Buffer</option><option value="future">Future Fund</option><option value="receivable">Receivable</option></select>
    <input className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none" type="number" min="0" step="0.01" placeholder="เงินต้น" value={investedAmount} onChange={(e) => setInvestedAmount(e.target.value)} required />
    <input className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none" type="number" min="0" step="0.01" placeholder="มูลค่าปัจจุบัน" value={currentValue} onChange={(e) => setCurrentValue(e.target.value)} required />
    <div className="flex gap-2"><button className="theme-button-primary">บันทึก</button><button type="button" onClick={onClose} className="theme-button-secondary">ยกเลิก</button></div>
  </form></div>;
}
