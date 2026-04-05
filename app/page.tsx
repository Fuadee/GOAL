import { Navbar } from '@/components/navbar';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <Navbar />

      <section className="mx-auto flex min-h-[calc(100vh-80px)] w-full max-w-6xl items-center px-6 py-20 md:px-10">
        <div className="max-w-2xl space-y-6">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Foundation</p>
          <h1 className="text-4xl font-semibold leading-tight text-white md:text-5xl">
            Clean, modern homepage starter
          </h1>
          <p className="text-base leading-relaxed text-slate-300 md:text-lg">
            Initial structure is ready for scalable development. Current scope includes only the premium navbar and
            a minimal hero placeholder.
          </p>
        </div>
      </section>
    </main>
  );
}
