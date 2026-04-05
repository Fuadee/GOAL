'use client';

import { FormEvent, useMemo, useState } from 'react';

import { InnovationCard, type Innovation } from '@/components/innovation/InnovationCard';
import { ProgressBar } from '@/components/innovation/ProgressBar';
import { Navbar } from '@/components/navbar';

const TARGET_INNOVATIONS = 10;

const initialInnovations: Innovation[] = [
  {
    id: 'solar-clean-pea',
    title: 'Solar Clean PEA',
    description: 'Build a smart solar cleaning process to improve panel performance and cut maintenance cost.',
    status: 'building'
  },
  {
    id: 'joinjoy-platform',
    title: 'JoinJoy Platform',
    description: 'Create a collaborative platform to connect projects, people, and opportunities for innovation.',
    status: 'idea'
  }
];

export default function InnovationPage() {
  const [innovations, setInnovations] = useState<Innovation[]>(initialInnovations);
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const doneCount = useMemo(
    () => innovations.filter((innovation) => innovation.status === 'done').length,
    [innovations]
  );

  const handleAddInnovation = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    if (!trimmedTitle || !trimmedDescription) {
      return;
    }

    const newInnovation: Innovation = {
      id: crypto.randomUUID(),
      title: trimmedTitle,
      description: trimmedDescription,
      status: 'idea'
    };

    setInnovations((prev) => [newInnovation, ...prev]);
    setTitle('');
    setDescription('');
    setIsAdding(false);
  };

  const handleMarkDone = (id: string) => {
    setInnovations((prev) =>
      prev.map((innovation) => (innovation.id === id ? { ...innovation, status: 'done' } : innovation))
    );
  };

  const handleDelete = (id: string) => {
    setInnovations((prev) => prev.filter((innovation) => innovation.id !== id));
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <Navbar />

      <section className="mx-auto w-full max-w-6xl space-y-8 px-6 py-16 md:px-10 md:py-20">
        <header className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Innovation Dashboard</p>
          <h1 className="text-4xl font-semibold text-white md:text-5xl">Innovation System</h1>
          <p className="text-base text-slate-300 md:text-lg">Build 10 innovations to unlock your potential</p>
        </header>

        <ProgressBar current={doneCount} total={TARGET_INNOVATIONS} />

        <section className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-white">Add Innovation</h2>
            <button
              type="button"
              onClick={() => setIsAdding((prev) => !prev)}
              className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              + Add Innovation
            </button>
          </div>

          {isAdding ? (
            <form onSubmit={handleAddInnovation} className="grid gap-3">
              <input
                type="text"
                placeholder="Innovation title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="rounded-xl border border-white/15 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-300"
              />
              <textarea
                placeholder="Innovation description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={3}
                className="rounded-xl border border-white/15 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-300"
              />
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  className="rounded-full bg-indigo-400/20 px-4 py-2 text-sm font-semibold text-indigo-200 transition hover:bg-indigo-400/30"
                >
                  Save Innovation
                </button>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/20"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : null}
        </section>

        {innovations.length === 0 ? (
          <section className="rounded-2xl border border-dashed border-white/20 bg-white/5 p-10 text-center backdrop-blur">
            <p className="text-slate-300">No innovation yet. Start building your future.</p>
          </section>
        ) : (
          <section className="grid gap-5 md:grid-cols-2">
            {innovations.map((innovation) => (
              <InnovationCard
                key={innovation.id}
                innovation={innovation}
                onMarkDone={handleMarkDone}
                onDelete={handleDelete}
              />
            ))}
          </section>
        )}
      </section>
    </main>
  );
}
