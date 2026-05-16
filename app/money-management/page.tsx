import { Navbar } from '@/components/navbar';
import { SimpleMoneyManagement } from '@/components/money/SimpleMoneyManagement';
import { getMoneyManagementData } from '@/lib/money/service';

export default async function MoneyManagementPage() {
  const data = await getMoneyManagementData();

  return (
    <main className="min-h-screen bg-slate-100/70">
      <Navbar />
      <SimpleMoneyManagement data={data} />
    </main>
  );
}
