'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { deleteGrowthAssetAction, deleteMoneyIncomeSourceAction, upsertGrowthAssetAction, upsertMoneyIncomeSourceAction } from '@/app/money-management/actions';
import { GrowthAssetRow, GrowthAssetType, MoneyManagementPageData, MoneyIncomeSourceRow } from '@/lib/money/types';

const thb = new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 });
const monthLabel = new Intl.DateTimeFormat('th-TH-u-ca-buddhist', { month: 'long', year: 'numeric' }).format(new Date());
const categoryMeta = {
  investment: { label: 'Investment', badge: 'INVESTMENT', color: '#22C55E', cardClass: 'border-emerald-200/80 bg-emerald-50/70 text-emerald-700', badgeClass: 'bg-emerald-100/90 text-emerald-700', iconText: 'I' },
  safe: { label: 'Safe / Buffer', badge: 'SAFE / BUFFER', color: '#60A5FA', cardClass: 'border-blue-200/80 bg-blue-50/70 text-blue-700', badgeClass: 'bg-blue-100/90 text-blue-700', iconText: 'S' },
  future: { label: 'Future Fund', badge: 'FUTURE FUND', color: '#F59E0B', cardClass: 'border-amber-200/80 bg-amber-50/80 text-amber-700', badgeClass: 'bg-amber-100/90 text-amber-700', iconText: 'F' },
  receivable: { label: 'Receivable', badge: 'RECEIVABLE', color: '#A78BFA', cardClass: 'border-violet-200/80 bg-violet-50/70 text-violet-700', badgeClass: 'bg-violet-100/90 text-violet-700', iconText: 'R' },
} as const;
type AssetCategory = keyof typeof categoryMeta;

function getAssetCategory(assetName: string): AssetCategory {
  const normalized = assetName.trim().toLowerCase();
  if (['etoro', 'binance', 'dime'].includes(normalized)) return 'investment';
  if (['saving account', 'reserve', 'บ้านละงู'].includes(normalized)) return 'safe';
  if (normalized === 'business invest') return 'future';
  if (normalized === 'h-outstanding') return 'receivable';
  return 'investment';
}

function financialColorClass(value: number) {
  if (value > 0) return 'text-emerald-600';
  if (value < 0) return 'text-rose-600';
  return 'text-slate-500';
}

export function SimpleMoneyManagement({ data }: { data: MoneyManagementPageData }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [editing, setEditing] = useState<MoneyIncomeSourceRow | null>(null);
  const [open, setOpen] = useState(false);
  const [growthOpen, setGrowthOpen] = useState(false);
  const [growthEditing, setGrowthEditing] = useState<GrowthAssetRow | null>(null);

  const rows = useMemo(() => data.incomeSources ?? [], [data.incomeSources]);
  const growthRows = useMemo(() => data.growthAssets ?? [], [data.growthAssets]);
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

    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-semibold text-slate-800">รายได้ของฉัน</h2><button onClick={openCreate} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">+ เพิ่มแหล่งรายได้</button></div>
        {rows.length === 0 ? <div className="rounded-2xl border border-dashed p-6 text-center text-slate-500">ยังไม่มีแหล่งรายได้ กด “เพิ่มแหล่งรายได้” เพื่อเริ่มต้น</div> : <>
          <div className="hidden overflow-x-auto md:block"><table className="w-full text-sm"><thead className="text-left text-slate-500"><tr><th>แหล่งรายได้</th><th>รายได้</th><th>ค่าใช้จ่าย</th><th>คงเหลือ</th><th></th></tr></thead><tbody>{rows.map((r)=><tr key={r.id} className="border-t"><td className="py-3"><p className="font-medium text-slate-800">{r.name}</p><p className="text-slate-500">{r.description ?? '-'}</p></td><td className="text-emerald-600">{thb.format(r.income_amount)}</td><td className="text-rose-600">{thb.format(r.expense_amount)} <span className="text-xs text-slate-500">{r.expense_note ? `(${r.expense_note})` : ''}</span></td><td className="font-semibold text-emerald-600">{thb.format(r.income_amount-r.expense_amount)}</td><td><div className="flex gap-2"><button onClick={()=>openEdit(r)} className="text-slate-600">แก้ไข</button><button onClick={()=>onDelete(r.id)} className="text-rose-600">ลบ</button></div></td></tr>)}</tbody></table></div>
          <div className="space-y-3 md:hidden">{rows.map((r)=><div key={r.id} className="rounded-xl border p-3"><p className="font-semibold">{r.name}</p><p className="text-sm text-slate-500">{r.description}</p><p className="text-sm text-emerald-600">รายได้ {thb.format(r.income_amount)}</p><p className="text-sm text-rose-600">ค่าใช้จ่าย {thb.format(r.expense_amount)}</p><p className="text-sm font-semibold text-emerald-600">คงเหลือ {thb.format(r.income_amount-r.expense_amount)}</p><div className="mt-2 flex gap-3"><button onClick={()=>openEdit(r)}>แก้ไข</button><button onClick={()=>onDelete(r.id)} className="text-rose-600">ลบ</button></div></div>)}</div>
        </>}
        <button onClick={openCreate} className="mt-4 flex w-full items-center gap-3 rounded-2xl border border-dashed p-4 text-left"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100">+</span><span><p className="font-medium text-slate-700">เพิ่มแหล่งรายได้ใหม่</p><p className="text-sm text-slate-500">เพิ่มแหล่งรายได้</p></span></button>
      </section>

      <GrowthAssetsCard rows={growthRows} totalValue={data.growthSummary.totalValue} totalProfitLoss={data.growthSummary.totalProfitLoss} onCreate={() => { setGrowthEditing(null); setGrowthOpen(true); }} onEdit={(row) => { setGrowthEditing(row); setGrowthOpen(true); }} onDelete={(id) => startTransition(async () => { if (!confirm('ยืนยันการลบ Growth Asset นี้?')) return; const res = await deleteGrowthAssetAction(id); if (res.success) router.refresh(); })} />
    </div>

    {open ? <MoneyForm row={editing} onClose={()=>setOpen(false)} onSubmit={(fd)=>startTransition(async()=>{const res=await upsertMoneyIncomeSourceAction(fd); if(res.success){setOpen(false);router.refresh();}})} /> : null}
    {growthOpen ? <GrowthAssetForm row={growthEditing} onClose={() => setGrowthOpen(false)} onSubmit={(fd) => startTransition(async () => { const res = await upsertGrowthAssetAction(fd); if (res.success) { setGrowthOpen(false); setGrowthEditing(null); router.refresh(); } })} /> : null}
  </div>;
}

function GrowthAssetsCard({ rows, totalValue, totalProfitLoss, onCreate, onEdit, onDelete }: { rows: GrowthAssetRow[]; totalValue: number; totalProfitLoss: number; onCreate: () => void; onEdit: (row: GrowthAssetRow) => void; onDelete: (id: string) => void }) {
  const viewRows = useMemo(() => rows.map((row) => {
    const category = getAssetCategory(row.asset_name);
    const effectiveCurrentValue = category === 'receivable' ? row.invested_amount : row.current_value;
    return { ...row, category, effectiveCurrentValue };
  }), [rows]);
  const categorySummary = useMemo(() => {
    const base = { investment: 0, safe: 0, future: 0, receivable: 0 } as Record<AssetCategory, number>;
    viewRows.forEach((row) => { base[row.category] += row.effectiveCurrentValue; });
    return base;
  }, [viewRows]);
  const chartData = (Object.keys(categoryMeta) as AssetCategory[]).map((key) => ({ key, name: categoryMeta[key].label, value: categorySummary[key], color: categoryMeta[key].color })).filter((item) => item.value > 0);
  const adjustedTotalValue = viewRows.reduce((sum, row) => sum + row.effectiveCurrentValue, 0);
  const adjustedTotalProfit = viewRows.reduce((sum, row) => sum + (row.category === 'receivable' ? 0 : row.profit_loss), 0);
  const adjustedTotalReturn = adjustedTotalValue > 0 ? (adjustedTotalProfit / adjustedTotalValue) * 100 : 0;

  return <section className="rounded-[24px] border border-slate-200/80 bg-white p-6 shadow-[0_20px_45px_-30px_rgba(15,23,42,0.24)]">
    <div className="flex items-start justify-between gap-3">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">สินทรัพย์ทั้งหมด</h2>
        <p className="text-sm text-slate-500">จัดกลุ่มตามประเภท</p>
      </div>
      <button className="rounded-xl bg-[#12233f] px-3 py-2 text-xs font-semibold text-white">ดูทั้งหมด</button>
    </div>
    <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div>
        <p className="text-sm text-slate-500">มูลค่ารวม</p>
        <p className="mt-1 text-3xl font-bold text-slate-900">{thb.format(adjustedTotalValue || totalValue)}</p>
        <p className="mt-4 text-sm text-slate-500">กำไร/ขาดทุนรวม</p>
        <p className="mt-1 text-xl font-semibold">
          <span className={financialColorClass(adjustedTotalProfit)}>{thb.format(adjustedTotalProfit || totalProfitLoss)}</span>{' '}
          <span className={financialColorClass(adjustedTotalReturn)}>({adjustedTotalReturn >= 0 ? '+' : ''}{adjustedTotalReturn.toFixed(2)}%)</span>
        </p>
        <div className="mt-5 flex gap-3 overflow-x-auto pb-2 xl:grid xl:grid-cols-2 xl:overflow-visible">
          {(Object.keys(categoryMeta) as AssetCategory[]).map((key) => {
            const pct = adjustedTotalValue > 0 ? (categorySummary[key] / adjustedTotalValue) * 100 : 0;
            return <div key={key} className={`min-w-[170px] shrink-0 rounded-2xl border px-3.5 py-3 ${categoryMeta[key].cardClass}`}>
              <div className="flex items-center gap-2"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/75 text-[11px] font-semibold">{categoryMeta[key].iconText}</span><p className="text-xs font-medium">{categoryMeta[key].label}</p></div>
              <p className="mt-2 text-xl font-semibold tracking-tight text-slate-900">{thb.format(categorySummary[key])}</p>
              <p className="text-sm text-slate-500">{pct.toFixed(2)}%</p>
            </div>;
          })}
        </div>
      </div>
      <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-[170px_minmax(0,1fr)] xl:grid-cols-1">
        <div className="h-44 sm:h-52">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={86} paddingAngle={2} stroke="none">
              {chartData.map((item) => <Cell key={item.key} fill={item.color} />)}
              </Pie>
              <Tooltip formatter={(value: number) => thb.format(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-2.5 text-sm">
          {chartData.map((item) => <div key={item.key} className="flex items-center justify-between gap-3 text-slate-600"><div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />{item.name}</div><span>{thb.format(item.value)}</span></div>)}
        </div>
      </div>
    </div>

    <div className="mt-5 rounded-2xl bg-slate-50/70 max-lg:overflow-x-auto">
      <table className="w-full text-xs sm:text-sm max-lg:min-w-[520px]">
        <thead className="text-left text-slate-500"><tr><th className="px-2 py-3.5 sm:px-3">สินทรัพย์</th><th className="px-2 py-3.5 sm:px-3">ประเภท</th><th className="px-2 py-3.5 sm:px-3">มูลค่าปัจจุบัน</th><th className="px-2 py-3.5 sm:px-3">กำไร/ขาดทุน</th><th className="px-2 py-3.5 sm:px-3">ผลตอบแทน</th><th className="px-2 py-3.5 sm:px-3">จัดการ</th></tr></thead>
        <tbody>{viewRows.map((r) => <tr key={r.id} className="border-t border-slate-100/80 transition hover:bg-white"><td className="px-2 py-4 font-medium text-slate-800 sm:px-3">{r.asset_name}</td><td className="px-2 py-4 sm:px-3"><span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-wide ${categoryMeta[r.category].badgeClass}`}>{categoryMeta[r.category].badge}</span></td><td className="px-2 py-4 text-slate-700 sm:px-3">{thb.format(r.effectiveCurrentValue)}</td><td className={`px-2 py-4 font-medium sm:px-3 ${financialColorClass(r.category === 'receivable' ? 0 : r.profit_loss)}`}>{r.category === 'receivable' ? <span className="text-amber-600">Pending Recovery</span> : thb.format(r.profit_loss)}</td><td className={`px-2 py-4 font-semibold sm:px-3 ${r.category === 'receivable' ? 'text-amber-600' : financialColorClass(r.return_percent)}`}>{r.category === 'receivable' ? <span>Awaiting repayment</span> : `${r.return_percent >= 0 ? '+' : ''}${r.return_percent.toFixed(2)}%`}</td><td className="px-2 py-4 sm:px-3"><div className="flex items-center gap-2 whitespace-nowrap text-sm"><button onClick={() => onEdit(r)} className="text-slate-500 hover:text-slate-700">แก้ไข</button><button onClick={() => onDelete(r.id)} className="text-rose-500 hover:text-rose-600">ลบ</button></div></td></tr>)}</tbody>
      </table>
    </div>
    <button onClick={onCreate} className="mt-5 flex w-full items-center justify-center rounded-xl border border-dashed border-slate-300 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50">+ เพิ่มสินทรัพย์ใหม่</button>
  </section>;
}

function Stat({ label, value, cls }: { label: string; value: number; cls: string }) { return <div className="rounded-2xl border border-white/10 bg-white/10 p-4 shadow-inner backdrop-blur-sm"><p className="text-xs text-slate-300">{label}</p><p className={`mt-1 text-2xl font-semibold ${cls}`}>{thb.format(value)}</p></div>; }

function MoneyForm({ row, onClose, onSubmit }: { row: MoneyIncomeSourceRow | null; onClose: ()=>void; onSubmit:(fd:FormData)=>void }) {
  const [name,setName]=useState(row?.name ?? ''); const [description,setDescription]=useState(row?.description ?? ''); const [income,setIncome]=useState(row? String(row.income_amount):''); const [expense,setExpense]=useState(row? String(row.expense_amount):''); const [note,setNote]=useState(row?.expense_note ?? '');
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"><form action={(fd)=>{if(row)fd.set('id',row.id);fd.set('name',name);fd.set('description',description);fd.set('income_amount',income);fd.set('expense_amount',expense);fd.set('expense_note',note);onSubmit(fd);}} className="w-full max-w-lg space-y-3 rounded-2xl bg-white p-5"><h3 className="text-lg font-semibold">{row ? 'แก้ไขแหล่งรายได้' : 'เพิ่มแหล่งรายได้'}</h3><input className="theme-input" placeholder="ชื่อแหล่งรายได้" value={name} onChange={(e)=>setName(e.target.value)} required /><textarea className="theme-input" placeholder="คำอธิบาย" value={description} onChange={(e)=>setDescription(e.target.value)} /><input className="theme-input" type="number" min="0" placeholder="รายได้" value={income} onChange={(e)=>setIncome(e.target.value)} /><input className="theme-input" type="number" min="0" placeholder="ค่าใช้จ่าย" value={expense} onChange={(e)=>setExpense(e.target.value)} /><input className="theme-input" placeholder="รายละเอียดค่าใช้จ่าย" value={note} onChange={(e)=>setNote(e.target.value)} /><div className="flex gap-2"><button className="theme-button-primary">บันทึก</button><button type="button" onClick={onClose} className="theme-button-secondary">ยกเลิก</button></div></form></div>;
}

function GrowthAssetForm({ row, onClose, onSubmit }: { row: GrowthAssetRow | null; onClose: () => void; onSubmit: (fd: FormData) => void }) {
  const [assetName, setAssetName] = useState(row?.asset_name ?? '');
  const [assetType, setAssetType] = useState<GrowthAssetType>(row?.asset_type ?? 'etf');
  const [platform, setPlatform] = useState(row?.platform ?? '');
  const [investedAmount, setInvestedAmount] = useState(row ? String(row.invested_amount) : '');
  const [currentValue, setCurrentValue] = useState(row ? String(row.current_value) : '');

  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"><form action={(fd) => { if (row) fd.set('id', row.id); fd.set('asset_name', assetName); fd.set('asset_type', assetType); fd.set('platform', platform); fd.set('invested_amount', investedAmount); fd.set('current_value', currentValue); onSubmit(fd); }} className="w-full max-w-lg space-y-3 rounded-2xl bg-white p-5"><h3 className="text-lg font-semibold">{row ? 'แก้ไข Growth Asset' : 'เพิ่ม Growth Asset ใหม่'}</h3><input className="theme-input" placeholder="ชื่อสินทรัพย์" value={assetName} onChange={(e) => setAssetName(e.target.value)} required /><select className="theme-input" value={assetType} onChange={(e) => setAssetType(e.target.value as GrowthAssetType)}><option value="etf">ETF</option><option value="stock">Stock</option><option value="mutual_fund">Mutual Fund</option><option value="crypto">Crypto</option><option value="gold">Gold</option><option value="other">Other</option></select><select className="theme-input" value={platform} onChange={(e) => setPlatform(e.target.value)}><option value="">เลือกแพลตฟอร์ม</option><option value="eToro">eToro</option><option value="Binance">Binance</option><option value="Streaming">Streaming</option><option value="Bank">Bank</option><option value="Other">Other</option></select><input className="theme-input" type="number" min="0" step="0.01" placeholder="เงินต้น" value={investedAmount} onChange={(e) => setInvestedAmount(e.target.value)} required /><input className="theme-input" type="number" min="0" step="0.01" placeholder="มูลค่าปัจจุบัน" value={currentValue} onChange={(e) => setCurrentValue(e.target.value)} required /><div className="flex gap-2"><button className="theme-button-primary">Save</button><button type="button" onClick={onClose} className="theme-button-secondary">ยกเลิก</button></div></form></div>;
}
