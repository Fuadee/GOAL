'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { deleteMoneyIncomeSourceAction, upsertMoneyIncomeSourceAction } from '@/app/money-management/actions';
import { MoneyManagementPageData, MoneyIncomeSourceRow } from '@/lib/money/types';

const thb = new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 });
const monthLabel = new Intl.DateTimeFormat('th-TH-u-ca-buddhist', { month: 'long', year: 'numeric' }).format(new Date());

export function SimpleMoneyManagement({ data }: { data: MoneyManagementPageData }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [editing, setEditing] = useState<MoneyIncomeSourceRow | null>(null);
  const [open, setOpen] = useState(false);

  const rows = useMemo(() => data.incomeSources, [data.incomeSources]);
  const onDelete = (id: string) => startTransition(async () => { await deleteMoneyIncomeSourceAction(id); router.refresh(); });

  const openCreate = () => { setEditing(null); setOpen(true); };
  const openEdit = (row: MoneyIncomeSourceRow) => { setEditing(row); setOpen(true); };

  return <div className="mx-auto w-full max-w-[1440px] space-y-6 px-4 py-4 md:px-6">
    <section className="rounded-3xl bg-gradient-to-br from-slate-900 via-[#152647] to-slate-900 p-6 text-white shadow-xl">
      <div className="flex items-start justify-between"><div><p className="text-sm text-slate-300">ภาพรวมการเงิน</p><p className="mt-2 text-4xl font-bold text-emerald-300">{thb.format(data.summary.netIncome)}</p><p className="text-sm text-slate-300">รายได้สุทธิ (คงเหลือ)</p></div><div className="rounded-xl border border-white/20 px-3 py-2 text-sm">{monthLabel}</div></div>
      <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3"><Stat label="รายได้รวม" value={data.summary.grossIncome} cls="text-emerald-300" /><Stat label="ค่าใช้จ่ายรวม" value={data.summary.totalExpense} cls="text-rose-300" /><Stat label="รายได้สุทธิ (คงเหลือ)" value={data.summary.netIncome} cls="text-emerald-300" /></div>
    </section>

    <section className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-semibold text-slate-800">รายได้ของฉัน</h2><button onClick={openCreate} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">+ เพิ่มแหล่งรายได้</button></div>
      <div className="hidden md:block overflow-x-auto"><table className="w-full text-sm"><thead className="text-left text-slate-500"><tr><th>แหล่งรายได้</th><th>รายได้</th><th>ค่าใช้จ่าย</th><th>คงเหลือ</th><th></th></tr></thead><tbody>{rows.map((r)=><tr key={r.id} className="border-t"><td className="py-3"><p className="font-medium text-slate-800">{r.name}</p><p className="text-slate-500">{r.description ?? '-'}</p></td><td className="text-emerald-600">{thb.format(r.income_amount)}</td><td className="text-rose-600">{thb.format(r.expense_amount)} <span className="text-xs text-slate-500">{r.expense_note ? `(${r.expense_note})` : ''}</span></td><td className="font-semibold text-emerald-600">{thb.format(r.income_amount-r.expense_amount)}</td><td><div className="flex gap-2"><button onClick={()=>openEdit(r)} className="text-slate-600">แก้ไข</button><button onClick={()=>onDelete(r.id)} className="text-rose-600">ลบ</button></div></td></tr>)}</tbody></table></div>
      <div className="space-y-3 md:hidden">{rows.map((r)=><div key={r.id} className="rounded-xl border p-3"><p className="font-semibold">{r.name}</p><p className="text-sm text-slate-500">{r.description}</p><p className="text-sm text-emerald-600">รายได้ {thb.format(r.income_amount)}</p><p className="text-sm text-rose-600">ค่าใช้จ่าย {thb.format(r.expense_amount)}</p><p className="text-sm font-semibold text-emerald-600">คงเหลือ {thb.format(r.income_amount-r.expense_amount)}</p><div className="mt-2 flex gap-3"><button onClick={()=>openEdit(r)}>แก้ไข</button><button onClick={()=>onDelete(r.id)} className="text-rose-600">ลบ</button></div></div>)}</div>
      <button onClick={openCreate} className="mt-4 flex w-full items-center gap-3 rounded-2xl border border-dashed p-4 text-left"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100">+</span><span><p className="font-medium text-slate-700">เพิ่มแหล่งรายได้ใหม่</p><p className="text-sm text-slate-500">เพิ่มแหล่งรายได้</p></span></button>
    </section>

    {open ? <MoneyForm row={editing} onClose={()=>setOpen(false)} onSubmit={(fd)=>startTransition(async()=>{const res=await upsertMoneyIncomeSourceAction(fd); if(res.success){setOpen(false);router.refresh();}})} /> : null}
  </div>;
}

function Stat({ label, value, cls }: { label: string; value: number; cls: string }) { return <div className="rounded-2xl bg-white/5 p-4"><p className="text-xs text-slate-300">{label}</p><p className={`text-2xl font-semibold ${cls}`}>{thb.format(value)}</p></div>; }

function MoneyForm({ row, onClose, onSubmit }: { row: MoneyIncomeSourceRow | null; onClose: ()=>void; onSubmit:(fd:FormData)=>void }) {
  const [name,setName]=useState(row?.name ?? ''); const [description,setDescription]=useState(row?.description ?? ''); const [income,setIncome]=useState(row? String(row.income_amount):''); const [expense,setExpense]=useState(row? String(row.expense_amount):''); const [note,setNote]=useState(row?.expense_note ?? '');
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"><form action={(fd)=>{if(row)fd.set('id',row.id);fd.set('name',name);fd.set('description',description);fd.set('income_amount',income);fd.set('expense_amount',expense);fd.set('expense_note',note);onSubmit(fd);}} className="w-full max-w-lg space-y-3 rounded-2xl bg-white p-5"><h3 className="text-lg font-semibold">{row ? 'แก้ไขแหล่งรายได้' : 'เพิ่มแหล่งรายได้'}</h3><input className="theme-input" placeholder="ชื่อแหล่งรายได้" value={name} onChange={(e)=>setName(e.target.value)} required /><textarea className="theme-input" placeholder="คำอธิบาย" value={description} onChange={(e)=>setDescription(e.target.value)} /><input className="theme-input" type="number" min="0" placeholder="รายได้" value={income} onChange={(e)=>setIncome(e.target.value)} /><input className="theme-input" type="number" min="0" placeholder="ค่าใช้จ่าย" value={expense} onChange={(e)=>setExpense(e.target.value)} /><input className="theme-input" placeholder="รายละเอียดค่าใช้จ่าย" value={note} onChange={(e)=>setNote(e.target.value)} /><div className="flex gap-2"><button className="theme-button-primary">บันทึก</button><button type="button" onClick={onClose} className="theme-button-secondary">ยกเลิก</button></div></form></div>;
}
