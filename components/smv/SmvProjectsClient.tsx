'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState, useTransition } from 'react';

import { deleteSmvProjectAction } from '@/app/smv/actions';
import { ProjectEditorModal } from '@/components/smv/ProjectEditorModal';
import type { SmvProjectRow, SmvProjectWithSummary } from '@/lib/smv/types';

type SmvProjectsClientProps = {
  initialProjects: SmvProjectWithSummary[];
  goalImageUrl: string | null;
};

export function SmvProjectsClient({ initialProjects, goalImageUrl }: SmvProjectsClientProps) {
  const [projects, setProjects] = useState(initialProjects);
  const [editorProject, setEditorProject] = useState<SmvProjectRow | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const overallProgress = useMemo(() => {
    const milestones = projects.flatMap((project) => project.smv_project_milestones ?? []);
    const completed = milestones.filter((milestone) => milestone.is_completed).length;
    return {
      completed,
      total: milestones.length,
      percentage: milestones.length > 0 ? Math.round((completed / milestones.length) * 100) : 0
    };
  }, [projects]);

  useEffect(() => {
    const closeMenu = () => setOpenMenuId(null);
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, []);

  const openCreate = () => {
    setEditorProject(null);
    setIsEditorOpen(true);
  };

  const openEdit = (project: SmvProjectRow) => {
    setOpenMenuId(null);
    setEditorProject(project);
    setIsEditorOpen(true);
  };

  const removeProject = (project: SmvProjectRow) => {
    setOpenMenuId(null);
    if (!window.confirm(`ลบโปรเจกต์ “${project.title}” ใช่หรือไม่\n\nMilestone และ Checklist ทั้งหมดภายในโปรเจกต์นี้จะถูกลบด้วย`)) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteSmvProjectAction(project.id);
      if (!result.success) {
        setError(result.message);
        return;
      }
      setProjects((current) => current.filter((item) => item.id !== project.id));
    });
  };

  return (
    <>
      <section className="mx-auto w-full max-w-[1280px] flex-1 px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
        <header className="flex flex-col gap-5 border-b border-slate-200 pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div><h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">เส้นทางสู่ความสัมพันธ์ที่ใช่</h1><p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">4 โปรเจกต์ที่ตั้งใจลงมือทำ เพื่อเติบโตและเปิดโอกาสให้ตัวเองได้พบคนที่เหมาะสม</p></div>
          <button type="button" onClick={openCreate} className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[#12233f] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_26px_-18px_rgba(15,23,42,0.8)] transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100 sm:w-auto">+ สร้างโปรเจกต์</button>
        </header>

        {error ? <p role="alert" className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}

        <article
          role="link"
          tabIndex={0}
          aria-label="เปิดเป้าหมายหลักในหน้าวิสัยทัศน์"
          onClick={() => router.push('/')}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              router.push('/');
            }
          }}
          className="group mt-7 grid cursor-pointer overflow-hidden rounded-[24px] border border-blue-200 bg-gradient-to-br from-white via-blue-50/40 to-sky-100/60 shadow-[0_22px_52px_-38px_rgba(37,99,235,0.55)] transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-[0_28px_60px_-36px_rgba(37,99,235,0.65)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100 md:grid-cols-[minmax(240px,0.8fr)_minmax(0,1.7fr)]"
        >
          <div className="relative min-h-[210px] overflow-hidden bg-blue-100 md:min-h-full">
            {goalImageUrl ? (
              <Image
                src={goalImageUrl}
                alt="ภาพเป้าหมายด้านความสัมพันธ์จากบอร์ดวิสัยทัศน์"
                fill
                priority
                sizes="(max-width: 767px) 100vw, 36vw"
                className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              />
            ) : (
              <div className="flex h-full min-h-[210px] items-center justify-center bg-gradient-to-br from-blue-100 to-sky-50 text-blue-600" aria-label="ยังไม่มีภาพเป้าหมายในบอร์ดวิสัยทัศน์">
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-14 w-14"><path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25S4.5 16.1 4.5 9.7A4.2 4.2 0 0 1 12 7.08 4.2 4.2 0 0 1 19.5 9.7c0 6.4-7.5 10.55-7.5 10.55Z" /></svg>
              </div>
            )}
          </div>

          <div className="flex min-w-0 flex-col justify-center p-5 sm:p-7 lg:p-8">
            <p className="text-sm font-semibold text-blue-700">เป้าหมายหลักของฉัน</p>
            <h2 className="mt-2 text-2xl font-semibold leading-tight text-slate-900 sm:text-3xl">สร้างตัวเองให้พร้อมสำหรับความสัมพันธ์ที่ใช่</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">ลงมือพัฒนาตัวเองให้ครบทั้ง 4 ด้าน เพื่อเพิ่มโอกาสในการได้รู้จัก พูดคุย และพบคู่ชีวิตที่เหมาะสมกับเรา</p>

            <div className="mt-6 rounded-2xl border border-blue-100 bg-white/80 p-4 shadow-sm sm:p-5">
              <div className="flex items-center justify-between gap-4">
                <span className="font-medium text-slate-700">ความพร้อมจากการลงมือทำ</span>
                <span className="font-numeric text-lg font-semibold text-blue-700">{overallProgress.percentage}%</span>
              </div>
              <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-blue-100" aria-label={`ความพร้อม ${overallProgress.percentage}%`} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={overallProgress.percentage}>
                <div className="h-full rounded-full bg-blue-600 transition-[width] duration-300" style={{ width: `${overallProgress.percentage}%` }} />
              </div>
              <p className="mt-3 text-sm text-slate-600">{overallProgress.total > 0 ? `สำเร็จแล้ว ${overallProgress.completed} จาก ${overallProgress.total} Milestones` : 'ยังไม่มี Milestone'}</p>
            </div>
          </div>
        </article>

        {projects.length === 0 ? (
          <section className="flex min-h-[52vh] flex-col items-center justify-center px-4 py-14 text-center"><h2 className="text-2xl font-semibold text-slate-950">ยังไม่มีโปรเจกต์</h2><p className="mt-2 text-sm leading-6 text-slate-600">เริ่มจากสร้างโปรเจกต์แรกที่คุณอยากพัฒนา</p><button type="button" onClick={openCreate} className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#12233f] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100">+ สร้างโปรเจกต์แรก</button></section>
        ) : (
          <section className="grid gap-5 py-7 lg:grid-cols-2">
            {projects.map((project) => (
              <article
                key={project.id}
                role="button"
                tabIndex={0}
                aria-label={`เปิดโปรเจกต์ ${project.title}`}
                onClick={() => router.push(`/smv/${project.id}`)}
                onKeyDown={(event) => {
                  if (event.target !== event.currentTarget) return;
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    router.push(`/smv/${project.id}`);
                  }
                }}
                className="group relative flex min-w-0 cursor-pointer flex-col overflow-visible rounded-[22px] border border-sky-200/80 bg-gradient-to-br from-white via-white to-sky-50/70 p-5 shadow-[0_16px_38px_-30px_rgba(14,116,144,0.45)] transition-all duration-200 hover:-translate-y-1 hover:border-blue-500 hover:shadow-[0_24px_48px_-28px_rgba(14,116,144,0.55)] focus-visible:-translate-y-1 focus-visible:border-blue-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100 sm:p-5"
              >
                <div className="flex min-w-0 items-start gap-3 pr-12 sm:gap-4">
                  <span aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-sky-200 bg-sky-100 text-sky-700 shadow-sm transition-transform duration-200 group-hover:scale-105 group-focus-visible:scale-105 sm:h-12 sm:w-12">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6"><path strokeLinecap="round" strokeLinejoin="round" d="M4 7.5h6l1.5 2H20v8.75A1.75 1.75 0 0 1 18.25 20H5.75A1.75 1.75 0 0 1 4 18.25V7.5Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M4 7.5V5.75C4 4.78 4.78 4 5.75 4h4.1c.46 0 .9.18 1.23.51L12.57 6H18.25C19.22 6 20 6.78 20 7.75V9.5" /></svg>
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="break-words text-xl font-semibold tracking-tight text-slate-800 sm:text-2xl">{project.title}</h2>
                    <p className="mt-1.5 line-clamp-3 break-words text-sm leading-6 text-slate-600">{project.description || 'ยังไม่มีรายละเอียดโปรเจกต์'}</p>
                  </div>
                </div>

                {(() => {
                  const milestones = project.smv_project_milestones ?? [];
                  const completedCount = milestones.filter((milestone) => milestone.is_completed).length;
                  const progress = milestones.length > 0 ? Math.round((completedCount / milestones.length) * 100) : 0;
                  return (
                    <>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="rounded-full border border-sky-200 bg-sky-100/80 px-3 py-1 text-xs font-medium text-sky-800">{milestones.length > 0 ? `${milestones.length} Milestones` : 'ยังไม่มี Milestone'}</span>
                        <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">กำลังดำเนินการ</span>
                      </div>
                      <div className="mt-4">
                        <div className="flex items-center justify-between gap-4 text-sm"><span className="font-medium text-slate-600">ความคืบหน้า</span><span className="font-semibold text-blue-700">{progress}%</span></div>
                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-sky-100"><div className="h-full rounded-full bg-gradient-to-r from-sky-500 to-blue-600 transition-all duration-300" style={{ width: `${progress}%` }} /></div>
                      </div>
                    </>
                  );
                })()}

                <div className="absolute right-4 top-4 sm:right-5 sm:top-5">
                  <button type="button" disabled={isPending} onClick={(event) => { event.stopPropagation(); setOpenMenuId((current) => current === project.id ? null : project.id); }} aria-label={`จัดการโปรเจกต์ ${project.title}`} aria-expanded={openMenuId === project.id} className="flex h-10 w-10 items-center justify-center rounded-full border border-transparent bg-white/80 text-xl text-slate-500 shadow-sm backdrop-blur transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100 disabled:opacity-50">⋮</button>
                  {openMenuId === project.id ? <div onClick={(event) => event.stopPropagation()} className="absolute right-0 top-11 z-20 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl"><button type="button" onClick={() => openEdit(project)} className="block w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50">แก้ไขโปรเจกต์</button><button type="button" onClick={() => removeProject(project)} className="block w-full px-4 py-2.5 text-left text-sm text-rose-600 hover:bg-rose-50">ลบโปรเจกต์</button></div> : null}
                </div>
              </article>
            ))}
          </section>
        )}
      </section>

      <ProjectEditorModal isOpen={isEditorOpen} project={editorProject} onClose={() => setIsEditorOpen(false)} onSaved={(savedProject) => {
        setProjects((current) => editorProject
          ? current.map((item) => item.id === savedProject.id
            ? { ...savedProject, smv_project_milestones: item.smv_project_milestones }
            : item)
          : [savedProject, ...current]);
        setIsEditorOpen(false);
        setEditorProject(null);
      }} />
    </>
  );
}
