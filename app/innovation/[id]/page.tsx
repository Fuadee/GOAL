import { notFound } from 'next/navigation';

import { Navbar } from '@/components/navbar';
import { InnovationAppsGoal } from '@/components/innovation/InnovationAppsGoal';
import { getInnovationDetailData } from '@/lib/innovation/service';

type InnovationDetailPageProps = {
  params: { id: string };
};

export default async function InnovationDetailPage({ params }: InnovationDetailPageProps) {
  const data = await getInnovationDetailData(params.id);
  if (!data) notFound();

  return (
    <main className="min-h-screen bg-slate-100/70">
      <Navbar />
      <InnovationAppsGoal innovation={data.innovation} apps={data.apps} />
    </main>
  );
}
