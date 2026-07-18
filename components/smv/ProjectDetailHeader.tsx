'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { deleteSmvProjectAction } from '@/app/smv/actions';
import { ProjectEditorModal } from '@/components/smv/ProjectEditorModal';
import type { SmvProjectRow } from '@/lib/smv/types';

export function ProjectDetailHeader({ initialProject }: { initialProject: SmvProjectRow }) {
  const [project, setProject] = useState(initialProject);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const removeProject = () => {
    if (!window.confirm(`ลบโปรเจกต์ “${project.title}” ใช่หรือไม่\n\nMilestone และ Checklist ทั้งหมดภายในโปรเจกต์นี้จะถูกลบด้วย`)) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteSmvProjectAction(project.id);
      if (!result.success) {
        setError(result.message);
        return;
      }
      router.push('/smv');
      router.refresh();
    });
  };

  return (
    <>
      <Link href="/smv" className="inline-flex min-h-10 items-center rounded-lg px-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100">← กลับไปโปรเจกต์ของฉัน</Link>
      <header className="mt-5 border-b border-sky-100 pb-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0"><h1 className="break-words text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">{project.title}</h1>{project.description ? <p className="mt-3 max-w-3xl whitespace-pre-wrap break-words text-sm leading-7 text-slate-600 sm:text-base">{project.description}</p> : null}</div>
          <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row"><button type="button" onClick={() => setIsEditorOpen(true)} className="inline-flex min-h-10 items-center justify-center rounded-xl border border-blue-200 bg-white px-4 text-sm font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100">แก้ไขโปรเจกต์</button><button type="button" onClick={removeProject} disabled={isPending} className="inline-flex min-h-10 items-center justify-center rounded-xl border border-rose-200 bg-white px-4 text-sm font-semibold text-rose-600 transition hover:border-rose-300 hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-100 disabled:opacity-50">{isPending ? 'กำลังลบ...' : 'ลบโปรเจกต์'}</button></div>
        </div>
        {error ? <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}
      </header>
      <ProjectEditorModal isOpen={isEditorOpen} project={project} onClose={() => setIsEditorOpen(false)} onSaved={(savedProject) => { setProject(savedProject); setIsEditorOpen(false); }} />
    </>
  );
}
