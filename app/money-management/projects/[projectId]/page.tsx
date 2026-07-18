import { notFound } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { ProjectDetailClient } from '@/components/money/SimpleMoneyManagement';
import { getConstructionProjectBudget } from '@/lib/money/queries';

export const dynamic = 'force-dynamic';

export default async function ProjectDetailPage({ params }: { params: { projectId: string } }) {
  const budgetData = await getConstructionProjectBudget(params.projectId);
  if (!budgetData.project) notFound();

  return <main className="app-shell min-h-screen">
    <Navbar />
    <div className="mx-auto w-full max-w-[1440px] px-4 pb-10 pt-6 sm:px-6 lg:px-8">
      <ProjectDetailClient budgetData={budgetData} />
    </div>
  </main>;
}
