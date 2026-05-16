import { getMoneyIncomeSources } from '@/lib/money/queries';
import { MoneyManagementPageData } from '@/lib/money/types';

export async function getMoneyManagementData(): Promise<MoneyManagementPageData> {
  let incomeSources = await getMoneyIncomeSources();

  if (incomeSources.length === 0) {
    incomeSources = [
      { id: 'demo-1', user_id: null, name: 'บ้านเช่านาตีน', description: 'รายได้จากค่าเช่า', income_amount: 25000, expense_amount: 7000, expense_note: 'ผ่อนบ้าน', sort_order: 0, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 'demo-2', user_id: null, name: 'Solar Project', description: 'รายได้จากการติดตั้ง', income_amount: 28500, expense_amount: 6000, expense_note: 'ต้นทุนอุปกรณ์', sort_order: 1, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 'demo-3', user_id: null, name: 'งานประจำ', description: 'เงินเดือน', income_amount: 30000, expense_amount: 10200, expense_note: 'ภาษี, กองทุน', sort_order: 2, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
    ];
  }
  const summary = incomeSources.reduce(
    (acc, row) => {
      acc.grossIncome += Number(row.income_amount);
      acc.totalExpense += Number(row.expense_amount);
      return acc;
    },
    { grossIncome: 0, totalExpense: 0, netIncome: 0 }
  );
  summary.netIncome = summary.grossIncome - summary.totalExpense;

  return { incomeSources, summary };
}
