import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Navbar } from '@/components/navbar';
import { MilestoneChecklistManager } from '@/components/smv/MilestoneChecklistManager';
import { getMilestoneChecklists } from '@/lib/smv/checklists';
import { getProjectMilestoneById } from '@/lib/smv/milestones';
import { getSmvProjectById } from '@/lib/smv/projects';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function SmvMilestoneDetailPage({ params }: { params: { dimension: string; milestoneId: string } }) {
  if (!UUID_PATTERN.test(params.dimension) || !UUID_PATTERN.test(params.milestoneId)) notFound();

  const [project, milestone, checklists] = await Promise.all([
    getSmvProjectById(params.dimension),
    getProjectMilestoneById(params.dimension, params.milestoneId),
    getMilestoneChecklists(params.milestoneId)
  ]);
  if (!project || !milestone) notFound();

  return (
    <main className="flex min-h-screen flex-col bg-white">
      <Navbar />
      <section className="mx-auto w-full max-w-[960px] flex-1 px-5 py-8 sm:px-8 sm:py-10">
        <Link href={`/smv/${project.id}`} className="inline-flex min-h-10 items-center rounded-lg px-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100">← กลับไปหน้า Project</Link>
        <MilestoneChecklistManager projectId={project.id} milestoneId={milestone.id} projectTitle={project.title} milestoneTitle={milestone.title} milestoneDescription={milestone.description} initialChecklists={checklists} />
      </section>
    </main>
  );
}
