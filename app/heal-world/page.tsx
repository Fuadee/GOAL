import { Navbar } from '@/components/navbar';
import { BloodDonationDashboard } from '@/components/heal-world/blood-donation/BloodDonationDashboard';
import { getBloodDonationDashboardData } from '@/lib/blood-donation/service';

export default async function HealWorldPage() {
  const initialData = await getBloodDonationDashboardData();

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <Navbar />

      <section className="mx-auto w-full max-w-6xl space-y-8 px-6 py-16 md:px-10 md:py-20">
        <header className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Heal the WORLD</p>
          <h1 className="text-4xl font-semibold text-white md:text-5xl">Blood Donation</h1>
          <p className="text-base text-slate-300 md:text-lg">
            ติดตามแผนบริจาค วันที่ไปจริง และโอกาสไปถึงเป้าหมาย 3 ครั้งจากข้อมูลจริงในระบบ
          </p>
        </header>

        <BloodDonationDashboard initialData={initialData} />
      </section>
    </main>
  );
}
