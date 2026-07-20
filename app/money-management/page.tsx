import { Navbar } from '@/components/navbar';
import { SimpleMoneyManagement } from '@/components/money/SimpleMoneyManagement';
import { getGoalVisionImages } from '@/lib/goal-vision/queries';
import { getGoalVisionPublicUrl } from '@/lib/goal-vision/storage';
import { getMoneyManagementData } from '@/lib/money/service';

export const dynamic = 'force-dynamic';

export default async function MoneyManagementPage() {
  const [data, goalVisionImages] = await Promise.all([
    getMoneyManagementData(),
    getGoalVisionImages()
  ]);
  const moneyVisionImage = goalVisionImages.find((image) => image.goal_key === 'money');

  return (
    <main className="app-shell min-h-screen">
      <Navbar />
      <SimpleMoneyManagement
        data={data}
        goalImageUrl={moneyVisionImage ? getGoalVisionPublicUrl(moneyVisionImage.image_path) : null}
      />
    </main>
  );
}
