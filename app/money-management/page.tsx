import { Navbar } from '@/components/navbar';
import { SimpleMoneyManagement } from '@/components/money/SimpleMoneyManagement';
import { getMoneyManagementData } from '@/lib/money/service';

export const dynamic = 'force-dynamic';

export default async function MoneyManagementPage() {
  const data = await getMoneyManagementData();

  return (
    <main className="app-shell min-h-screen">
      <Navbar />
      <SimpleMoneyManagement data={data} />
    </main>
  );
}
