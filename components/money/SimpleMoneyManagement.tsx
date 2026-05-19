'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { deleteGrowthAssetAction, deleteMoneyIncomeSourceAction, upsertGrowthAssetAction, upsertMoneyIncomeSourceAction } from '@/app/money-management/actions';
import { GrowthAssetRow, GrowthAssetType, MoneyManagementPageData, MoneyIncomeSourceRow } from '@/lib/money/types';

const thb = new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 });
const monthLabel = new Intl.DateTimeFormat('th-TH-u-ca-buddhist', { month: 'long', year: 'numeric' }).format(new Date());
const donutColors = ['#8B5CF6', '#64748B', '#14B8A6', '#3B82F6', '#F59E0B'];

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
    <section className="rounded-3xl bg-gradient-to-br from-slate-900 via-[#152647] to-slate-900 p-6 text-white shadow-xl">
      <div className="flex items-start justify-between"><div><p className="text-sm text-slate-300">ภาพรวมการเงิน</p><p className="mt-2 text-4xl font-bold text-emerald-300">{thb.format(data.summary.netIncome)}</p><p className="text-sm text-slate-300">รายได้สุทธิ (คงเหลือ)</p></div><div className="rounded-xl border border-white/20 px-3 py-2 text-sm">{monthLabel}</div></div>
      <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3"><Stat label="รายได้รวม" value={data.summary.grossIncome} cls="text-emerald-300" /><Stat label="ค่าใช้จ่ายรวม" value={data.summary.totalExpense} cls="text-rose-300" /><Stat label="รายได้สุทธิ (คงเหลือ)" value={data.summary.netIncome} cls="text-emerald-300" /></div>
    </section>

    <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-5">
      <section className="rounded-2xl bg-white p-5 shadow-sm xl:col-span-3">
        <div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-semibold text-slate-800">รายได้ของฉัน</h2><button onClick={openCreate} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">+ เพิ่มแหล่งรายได้</button></div>
        {rows.length === 0 ? <div className="rounded-2xl border border-dashed p-6 text-center text-slate-500">ยังไม่มีแหล่งรายได้ กด “เพิ่มแหล่งรายได้” เพื่อเริ่มต้น</div> : <>
          <div className="hidden overflow-x-auto md:block"><table className="w-full text-sm"><thead className="text-left text-slate-500"><tr><th>แหล่งรายได้</th><th>รายได้</th><th>ค่าใช้จ่าย</th><th>คงเหลือ</th><th></th></tr></thead><tbody>{rows.map((r)=><tr key={r.id} className="border-t"><td className="py-3"><p className="font-medium text-slate-800">{r.name}</p><p className="text-slate-500">{r.description ?? '-'}</p></td><td className="text-emerald-600">{thb.format(r.income_amount)}</td><td className="text-rose-600">{thb.format(r.expense_amount)} <span className="text-xs text-slate-500">{r.expense_note ? `(${r.expense_note})` : ''}</span></td><td className="font-semibold text-emerald-600">{thb.format(r.income_amount-r.expense_amount)}</td><td><div className="flex gap-2"><button onClick={()=>openEdit(r)} className="text-slate-600">แก้ไข</button><button onClick={()=>onDelete(r.id)} className="text-rose-600">ลบ</button></div></td></tr>)}</tbody></table></div>
          <div className="space-y-3 md:hidden">{rows.map((r)=><div key={r.id} className="rounded-xl border p-3"><p className="font-semibold">{r.name}</p><p className="text-sm text-slate-500">{r.description}</p><p className="text-sm text-emerald-600">รายได้ {thb.format(r.income_amount)}</p><p className="text-sm text-rose-600">ค่าใช้จ่าย {thb.format(r.expense_amount)}</p><p className="text-sm font-semibold text-emerald-600">คงเหลือ {thb.format(r.income_amount-r.expense_amount)}</p><div className="mt-2 flex gap-3"><button onClick={()=>openEdit(r)}>แก้ไข</button><button onClick={()=>onDelete(r.id)} className="text-rose-600">ลบ</button></div></div>)}</div>
        </>}
        <button onClick={openCreate} className="mt-4 flex w-full items-center gap-3 rounded-2xl border border-dashed p-4 text-left"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100">+</span><span><p className="font-medium text-slate-700">เพิ่มแหล่งรายได้ใหม่</p><p className="text-sm text-slate-500">เพิ่มแหล่งรายได้</p></span></button>
      </section>

      <GrowthAssetsCard rows={growthRows} totalValue={data.growthSummary.totalValue} totalProfitLoss={data.growthSummary.totalProfitLoss} totalReturnPercent={data.growthSummary.totalReturnPercent} onCreate={() => { setGrowthEditing(null); setGrowthOpen(true); }} onEdit={(row) => { setGrowthEditing(row); setGrowthOpen(true); }} onDelete={(id) => startTransition(async () => { if (!confirm('ยืนยันการลบ Growth Asset นี้?')) return; const res = await deleteGrowthAssetAction(id); if (res.success) router.refresh(); })} />
    </div>

    {open ? <MoneyForm row={editing} onClose={()=>setOpen(false)} onSubmit={(fd)=>startTransition(async()=>{const res=await upsertMoneyIncomeSourceAction(fd); if(res.success){setOpen(false);router.refresh();}})} /> : null}
    {growthOpen ? <GrowthAssetForm row={growthEditing} onClose={() => setGrowthOpen(false)} onSubmit={(fd) => startTransition(async () => { const res = await upsertGrowthAssetAction(fd); if (res.success) { setGrowthOpen(false); setGrowthEditing(null); router.refresh(); } })} /> : null}
  </div>;
}

function GrowthAssetsCard({ rows, totalValue, totalProfitLoss, totalReturnPercent, onCreate, onEdit, onDelete }: { rows: GrowthAssetRow[]; totalValue: number; totalProfitLoss: number; totalReturnPercent: number; onCreate: () => void; onEdit: (row: GrowthAssetRow) => void; onDelete: (id: string) => void }) {
  return <section className="xl:col-span-2 rounded-[24px] border border-slate-200 bg-white p-6 shadow-[0_20px_45px_-30px_rgba(15,23,42,0.3)]">
    <div className="flex items-start justify-between gap-3">
      <h2 className="text-xl font-semibold text-slate-900">Growth Assets (ทรัพย์สินเพื่อการเติบโต)</h2>
      <button className="rounded-xl bg-[#12233f] px-3 py-2 text-xs font-semibold text-white">ดูทั้งหมด</button>
    </div>
    <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <p className="text-sm text-slate-500">มูลค่ารวม</p>
        <p className="mt-1 text-3xl font-bold text-slate-900">{thb.format(totalValue)}</p>
        <p className="mt-4 text-sm text-slate-500">กำไรรวม</p>
        <p className="mt-1 text-xl font-semibold text-emerald-600">{thb.format(totalProfitLoss)} ({totalReturnPercent >= 0 ? '+' : ''}{totalReturnPercent.toFixed(2)}%)</p>
      </div>
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={rows} dataKey="current_value" nameKey="asset_name" innerRadius={48} outerRadius={72} paddingAngle={3}>
              {rows.map((_, idx) => <Cell key={idx} fill={donutColors[idx % donutColors.length]} />)}
            </Pie>
            <Tooltip formatter={(value: number) => thb.format(value)} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>

    <div className="mt-5 overflow-x-auto rounded-2xl bg-slate-50/70">
      <table className="min-w-[520px] w-full text-sm">
        <thead className="text-left text-slate-500"><tr><th className="px-4 py-3">สินทรัพย์</th><th className="px-4 py-3">มูลค่าปัจจุบัน</th><th className="px-4 py-3">กำไร/ขาดทุน</th><th className="px-4 py-3">ผลตอบแทน</th><th className="px-4 py-3"></th></tr></thead>
        <tbody>{rows.map((r) => <tr key={r.id} className="border-t border-slate-100 transition hover:bg-white"><td className="px-4 py-3 font-medium text-slate-800">{r.asset_name}</td><td className="px-4 py-3 text-slate-700">{thb.format(r.current_value)}</td><td className={`px-4 py-3 font-medium ${r.profit_loss >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{thb.format(r.profit_loss)}</td><td className={`px-4 py-3 font-semibold ${r.return_percent >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{r.return_percent >= 0 ? '+' : ''}{r.return_percent.toFixed(2)}%</td><td className="px-4 py-3"><div className="flex gap-2 text-xs"><button onClick={() => onEdit(r)} className="text-slate-600">แก้ไข</button><button onClick={() => onDelete(r.id)} className="text-rose-600">ลบ</button></div></td></tr>)}</tbody>
      </table>
    </div>
    <button onClick={onCreate} className="mt-5 flex w-full items-center justify-center rounded-xl border border-dashed border-slate-300 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50">+ เพิ่ม Growth Asset ใหม่</button>
  </section>;
}

function Stat({ label, value, cls }: { label: string; value: number; cls: string }) { return <div className="rounded-2xl bg-white/5 p-4"><p className="text-xs text-slate-300">{label}</p><p className={`text-2xl font-semibold ${cls}`}>{thb.format(value)}</p></div>; }

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
