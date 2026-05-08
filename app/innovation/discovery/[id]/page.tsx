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
    <main className="min-h-screen bg-white">
      <Navbar />
      <section className="mx-auto w-full max-w-6xl px-6 py-16 md:px-10 md:py-20">
        <DiscoveryCandidateDetailPanel candidate={candidate} />
      </section>
    </main>
  );
}
