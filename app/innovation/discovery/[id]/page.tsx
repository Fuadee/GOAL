import { notFound } from 'next/navigation';

import { DiscoveryCandidateDetailPanel } from '@/components/innovation/DiscoveryCandidateDetailPanel';
import { Navbar } from '@/components/navbar';
import { getDiscoveryCandidateDetailData } from '@/lib/innovation/service';

type DiscoveryCandidateDetailPageProps = {
  params: { id: string };
};

export default async function DiscoveryCandidateDetailPage({ params }: DiscoveryCandidateDetailPageProps) {
  const candidate = await getDiscoveryCandidateDetailData(params.id);

  if (!candidate) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-100/70">
      <Navbar />
      <section className="page-container">
        <DiscoveryCandidateDetailPanel candidate={candidate} />
      </section>
    </main>
  );
}
