import { Navbar } from '@/components/navbar';

export default function InnovationLoadingPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <section className="mx-auto w-full max-w-6xl px-6 py-16 text-[#64748B] md:px-10 md:py-20">Loading innovation data...</section>
    </main>
  );
}
