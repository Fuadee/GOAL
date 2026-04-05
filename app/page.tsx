import Navbar from "../components/navbar";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white text-zinc-900">
      <Navbar />

      <main className="mx-auto flex w-full max-w-7xl px-6 pb-16 pt-20 md:px-8 md:pt-28">
        <section className="w-full rounded-3xl border border-zinc-200/80 bg-white/90 p-8 shadow-[0_20px_80px_-40px_rgba(0,0,0,0.25)] md:p-14">
          <p className="mb-4 inline-flex rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
            Starter Layout
          </p>
          <h1 className="max-w-3xl text-3xl font-semibold leading-tight tracking-tight text-zinc-900 md:text-5xl">
            Web app with your main navbar
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-600 md:text-lg">
            This is a clean and modern starting page designed as a premium foundation for future feature expansion.
          </p>
        </section>
      </main>
    </div>
  );
}
