'use client';

import { useMemo, useState } from 'react';

import { HouseCard } from '@/components/money/HouseCard';
import { LoanTrackingSection } from '@/components/money/LoanTrackingSection';
import { MasterProgressCard } from '@/components/money/MasterProgressCard';
import { MilestoneRoadmap } from '@/components/money/MilestoneRoadmap';
import { MonthlyCashFlowSection } from '@/components/money/MonthlyCashFlowSection';
import { ProgressSection } from '@/components/money/ProgressSection';
import { initialRentalHouses } from '@/components/money/mock-data';
import { getStageIndex } from '@/components/money/stage-utils';
import { RENTAL_TARGET_HOUSES, RentalHouse } from '@/components/money/types';
import { Navbar } from '@/components/navbar';

const RENT_READY_STAGE_INDEX = 5;
const RENTED_STAGE_INDEX = 6;

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(value);

export default function MoneyManagementPage() {
  const [houses, setHouses] = useState<RentalHouse[]>(initialRentalHouses);

  const metrics = useMemo(() => {
    const completed = houses.filter((house) => getStageIndex(house.currentStage) >= RENT_READY_STAGE_INDEX).length;
    const rented = houses.filter((house) => getStageIndex(house.currentStage) >= RENTED_STAGE_INDEX).length;
    const underConstruction = houses.filter((house) => house.currentStage === 'under_construction').length;
    const loanInProgress = houses.filter((house) => getStageIndex(house.currentStage) <= 2).length;

    const totalRentIncome = houses.reduce((sum, house) => sum + house.monthlyRent, 0);
    const totalInstallment = houses.reduce((sum, house) => sum + house.monthlyInstallment, 0);
    const totalExpense = houses.reduce((sum, house) => sum + house.monthlyExpense, 0);
    const netCashFlow = houses.reduce((sum, house) => sum + house.netCashFlow, 0);

    const rentable = houses.filter((house) => getStageIndex(house.currentStage) >= RENT_READY_STAGE_INDEX).length;
    const occupied = houses.filter((house) => getStageIndex(house.currentStage) >= RENTED_STAGE_INDEX).length;
    const occupancyRate = rentable > 0 ? (occupied / rentable) * 100 : 0;

    return {
      completed,
      rented,
      underConstruction,
      loanInProgress,
      totalRentIncome,
      totalInstallment,
      totalExpense,
      netCashFlow,
      occupancyRate
    };
  }, [houses]);

  const handleAddHouse = () => {
    setHouses((prev) => {
      const nextOrder = prev.length + 1;

      const nextHouse: RentalHouse = {
        id: crypto.randomUUID(),
        name: `House ${nextOrder.toString().padStart(2, '0')}`,
        targetOrder: nextOrder,
        currentStage: 'planning',
        budget: 3000000,
        loanAmount: 2400000,
        approvedAmount: 0,
        monthlyInstallment: 19500,
        monthlyRent: 0,
        monthlyExpense: 4200,
        netCashFlow: -23700,
        startDate: new Date().toISOString().slice(0, 10),
        targetCompleteDate: '2027-03-31',
        note: 'New mission created. Prepare loan plan and land checklist.',
        lender: 'TBD',
        loanSubmittedDate: '-'
      };

      return [...prev, nextHouse].slice(0, RENTAL_TARGET_HOUSES);
    });
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <Navbar />

      <section className="mx-auto w-full max-w-6xl space-y-8 px-6 py-16 md:px-10 md:py-20">
        <header className="space-y-5">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Rental Portfolio Dashboard</p>
            <h1 className="text-4xl font-semibold text-white md:text-5xl">Money Management</h1>
            <p className="max-w-3xl text-base text-slate-300 md:text-lg">
              Build 12 rental houses and turn debt into long-term cash flow.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <HeroStat label="Built" value={`${metrics.completed} / ${RENTAL_TARGET_HOUSES}`} />
            <HeroStat label="Rented" value={`${metrics.rented} houses`} />
            <HeroStat label="Under Construction" value={`${metrics.underConstruction} houses`} />
            <HeroStat label="Loan Pipeline" value={`${metrics.loanInProgress} houses`} />
          </div>
        </header>

        <MasterProgressCard
          totalTarget={RENTAL_TARGET_HOUSES}
          completed={metrics.completed}
          rented={metrics.rented}
          underConstruction={metrics.underConstruction}
          loanInProgress={metrics.loanInProgress}
          totalRentIncome={metrics.totalRentIncome}
          totalDebtPerMonth={metrics.totalInstallment}
          netCashFlow={metrics.netCashFlow}
        />

        <section className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Portfolio Pipeline</p>
              <h2 className="text-2xl font-semibold text-white">Each house is one mission</h2>
            </div>
            <button
              type="button"
              onClick={handleAddHouse}
              disabled={houses.length >= RENTAL_TARGET_HOUSES}
              className="rounded-full border border-indigo-300/40 bg-indigo-300/15 px-4 py-2 text-sm font-semibold text-indigo-100 transition hover:bg-indigo-300/25 disabled:cursor-not-allowed disabled:opacity-50"
            >
              + Add House
            </button>
          </div>

          <ProgressSection
            title="Project Coverage"
            valueLabel={`${houses.length} missions active from ${RENTAL_TARGET_HOUSES} planned houses`}
            percent={(houses.length / RENTAL_TARGET_HOUSES) * 100}
            helperText={`Monthly net cash flow ${formatCurrency(metrics.netCashFlow)} across all active houses.`}
          />

          {houses.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/20 bg-slate-900/45 p-10 text-center">
              <p className="text-lg font-medium text-white">Start your first rental house project</p>
              <p className="mt-2 text-sm text-slate-300">Build mission #01 and begin your 12-house roadmap.</p>
              <button
                type="button"
                onClick={handleAddHouse}
                className="mt-4 rounded-full border border-sky-300/30 bg-sky-300/15 px-5 py-2 text-sm font-semibold text-sky-100 transition hover:bg-sky-300/25"
              >
                + Add first house
              </button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {houses.map((house) => (
                <HouseCard key={house.id} house={house} />
              ))}
            </div>
          )}
        </section>

        <LoanTrackingSection houses={houses} />

        <MonthlyCashFlowSection
          totalIncome={metrics.totalRentIncome}
          totalExpense={metrics.totalExpense}
          totalInstallment={metrics.totalInstallment}
          netCashFlow={metrics.netCashFlow}
          occupancyRate={metrics.occupancyRate}
        />

        <MilestoneRoadmap completedHouses={metrics.completed} rentedHouses={metrics.rented} />
      </section>
    </main>
  );
}

type HeroStatProps = {
  label: string;
  value: string;
};

function HeroStat({ label, value }: HeroStatProps) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-2 text-xl font-semibold text-white">{value}</p>
    </article>
  );
}
