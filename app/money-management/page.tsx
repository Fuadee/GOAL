'use client';

import { useMemo, useState } from 'react';

import { Navbar } from '@/components/navbar';

const TARGET_HOUSES = 12;
const DEFAULT_PHASE_SIZE = 3;

type PlannerInputs = {
  monthlyIncome: string;
  existingDebtPerMonth: string;
  annualInterestRate: string;
  loanYears: string;
  downPaymentPerHouse: string;
  constructionCostPerHouse: string;
  expectedRentPerHouse: string;
  operatingCostPerHouse: string;
};

const initialInputs: PlannerInputs = {
  monthlyIncome: '120000',
  existingDebtPerMonth: '20000',
  annualInterestRate: '6.2',
  loanYears: '20',
  downPaymentPerHouse: '700000',
  constructionCostPerHouse: '2800000',
  expectedRentPerHouse: '18000',
  operatingCostPerHouse: '3200'
};

const PHASES = [
  {
    title: 'Understand loan math',
    checks: ['กำหนดวงเงินกู้ต่อหลัง', 'คำนวณค่างวดรายเดือน', 'เช็ก DSR และภาระหนี้รวม']
  },
  {
    title: 'Validate first house',
    checks: ['ทดสอบค่าเช่าจริงเทียบสมมติฐาน', 'บันทึกค่าใช้จ่ายดำเนินงาน', 'ยืนยันกระแสเงินสดสุทธิบวก']
  },
  {
    title: 'Scale to 4 houses',
    checks: ['ทำแบบบ้านซ้ำได้', 'วางทีมช่างและผู้รับเหมา', 'ตั้งระบบบริหารผู้เช่า']
  },
  {
    title: 'Reach 12-house portfolio',
    checks: ['ขยายเป็นเฟสละ 3 หลัง', 'รีไฟแนนซ์เมื่อดอกเบี้ยเหมาะสม', 'เน้นอัตราเช่าเต็มและซ่อมบำรุงเชิงรุก']
  }
];

const formatCurrency = (value?: number) => {
  if (value === undefined || Number.isNaN(value)) {
    return '—';
  }

  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    maximumFractionDigits: 0
  }).format(value);
};

const formatNumber = (value?: number, digits = 1) => {
  if (value === undefined || Number.isNaN(value)) {
    return '—';
  }

  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits
  }).format(value);
};

const parseNumber = (value: string): number | undefined => {
  if (value.trim() === '') {
    return undefined;
  }

  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : undefined;
};

const getMonthlyInstallment = (loanAmount: number, annualRate: number, years: number): number | undefined => {
  if (loanAmount <= 0 || annualRate <= 0 || years <= 0) {
    return undefined;
  }

  const monthlyRate = annualRate / 100 / 12;
  const periods = years * 12;
  return (loanAmount * monthlyRate * (1 + monthlyRate) ** periods) / ((1 + monthlyRate) ** periods - 1);
};

export default function MoneyManagementPage() {
  const [inputs, setInputs] = useState<PlannerInputs>(initialInputs);

  const metrics = useMemo(() => {
    const monthlyIncome = parseNumber(inputs.monthlyIncome);
    const existingDebtPerMonth = parseNumber(inputs.existingDebtPerMonth);
    const annualInterestRate = parseNumber(inputs.annualInterestRate);
    const loanYears = parseNumber(inputs.loanYears);
    const downPaymentPerHouse = parseNumber(inputs.downPaymentPerHouse);
    const constructionCostPerHouse = parseNumber(inputs.constructionCostPerHouse);
    const expectedRentPerHouse = parseNumber(inputs.expectedRentPerHouse);
    const operatingCostPerHouse = parseNumber(inputs.operatingCostPerHouse);

    const loanAmountPerHouse =
      constructionCostPerHouse !== undefined && downPaymentPerHouse !== undefined
        ? Math.max(constructionCostPerHouse - downPaymentPerHouse, 0)
        : undefined;

    const monthlyInstallmentPerHouse =
      loanAmountPerHouse !== undefined && annualInterestRate !== undefined && loanYears !== undefined
        ? getMonthlyInstallment(loanAmountPerHouse, annualInterestRate, loanYears)
        : undefined;

    const netCashflowPerHouse =
      expectedRentPerHouse !== undefined && monthlyInstallmentPerHouse !== undefined && operatingCostPerHouse !== undefined
        ? expectedRentPerHouse - monthlyInstallmentPerHouse - operatingCostPerHouse
        : undefined;

    const maxDebtServiceRatio = 0.4;
    const estimatedLoanCapacity =
      monthlyIncome !== undefined && existingDebtPerMonth !== undefined && annualInterestRate !== undefined && loanYears !== undefined
        ? (() => {
            const availableInstallment = monthlyIncome * maxDebtServiceRatio - existingDebtPerMonth;
            if (availableInstallment <= 0) {
              return 0;
            }

            const monthlyRate = annualInterestRate / 100 / 12;
            const periods = loanYears * 12;

            if (monthlyRate <= 0 || periods <= 0) {
              return undefined;
            }

            return (availableInstallment * ((1 + monthlyRate) ** periods - 1)) / (monthlyRate * (1 + monthlyRate) ** periods);
          })()
        : undefined;

    const totalCashNeededPerHouse =
      downPaymentPerHouse !== undefined && operatingCostPerHouse !== undefined
        ? downPaymentPerHouse + operatingCostPerHouse * 6
        : undefined;

    const profitableHousesTarget =
      netCashflowPerHouse !== undefined && netCashflowPerHouse > 0 ? Math.ceil(TARGET_HOUSES / DEFAULT_PHASE_SIZE) : undefined;

    const recommendedPhasePlan =
      profitableHousesTarget === undefined
        ? 'กรอกข้อมูลให้ครบเพื่อวางแผนเฟสแบบแม่นยำ'
        : `Start with 1 house → confirm cash flow → scale ${DEFAULT_PHASE_SIZE} houses per phase (${profitableHousesTarget} phases to ${TARGET_HOUSES})`;

    const grossRentalIncomePerMonth =
      expectedRentPerHouse !== undefined ? expectedRentPerHouse * TARGET_HOUSES : undefined;
    const totalDebtServicePerMonth =
      monthlyInstallmentPerHouse !== undefined ? monthlyInstallmentPerHouse * TARGET_HOUSES : undefined;
    const totalOperatingCostPerMonth =
      operatingCostPerHouse !== undefined ? operatingCostPerHouse * TARGET_HOUSES : undefined;

    const passiveIncomePerMonth =
      grossRentalIncomePerMonth !== undefined &&
      totalDebtServicePerMonth !== undefined &&
      totalOperatingCostPerMonth !== undefined
        ? grossRentalIncomePerMonth - totalDebtServicePerMonth - totalOperatingCostPerMonth
        : undefined;

    const passiveIncomePerYear = passiveIncomePerMonth !== undefined ? passiveIncomePerMonth * 12 : undefined;

    const estimatedPaybackPeriod =
      constructionCostPerHouse !== undefined &&
      downPaymentPerHouse !== undefined &&
      netCashflowPerHouse !== undefined &&
      netCashflowPerHouse > 0
        ? (constructionCostPerHouse + downPaymentPerHouse) / netCashflowPerHouse / 12
        : undefined;

    return {
      monthlyIncome,
      existingDebtPerMonth,
      annualInterestRate,
      loanYears,
      downPaymentPerHouse,
      constructionCostPerHouse,
      expectedRentPerHouse,
      operatingCostPerHouse,
      estimatedLoanCapacity,
      monthlyInstallmentPerHouse,
      totalCashNeededPerHouse,
      netCashflowPerHouse,
      loanAmountPerHouse,
      recommendedPhasePlan,
      grossRentalIncomePerMonth,
      totalDebtServicePerMonth,
      totalOperatingCostPerMonth,
      passiveIncomePerMonth,
      passiveIncomePerYear,
      estimatedPaybackPeriod
    };
  }, [inputs]);

  const handleInputChange = (key: keyof PlannerInputs, value: string) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const houseStatus =
    metrics.netCashflowPerHouse === undefined
      ? 'Break-even'
      : metrics.netCashflowPerHouse > 0
        ? 'Profitable'
        : metrics.netCashflowPerHouse === 0
          ? 'Break-even'
          : 'Negative cash flow';

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <Navbar />

      <section className="mx-auto w-full max-w-6xl space-y-8 px-6 py-14 md:px-10">
        <header className="space-y-6">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.28em] text-indigo-200/70">Dream + Feasibility Calculator</p>
            <h1 className="text-4xl font-semibold text-white md:text-5xl">Money Management</h1>
            <p className="max-w-3xl text-base text-slate-300 md:text-lg">
              Goal: build 12 rental houses and turn them into long-term passive income.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <HeroKpi label="Target Houses" value={`${TARGET_HOUSES} houses`} helper="เป้าหมายพอร์ตเช่าระยะยาว" />
            <HeroKpi
              label="Estimated Passive Income / Month"
              value={formatCurrency(metrics.passiveIncomePerMonth)}
              helper="รายรับสุทธิหลังหักค่างวดและค่าใช้จ่าย"
            />
            <HeroKpi
              label="Estimated Payback Period"
              value={metrics.estimatedPaybackPeriod ? `${formatNumber(metrics.estimatedPaybackPeriod, 1)} years` : '—'}
              helper="เวลาคืนทุนโดยประมาณจากโมเดล 1 หลัง"
            />
          </div>
        </header>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
          <div className="mb-5 space-y-1">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Loan Power Calculator</p>
            <h2 className="text-2xl font-semibold text-white">คำนวณกำลังกู้ + เศรษฐศาสตร์บ้านเช่า</h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
            <div className="grid gap-4 sm:grid-cols-2">
              <InputField label="รายได้ต่อเดือน (monthlyIncome)" value={inputs.monthlyIncome} onChange={(value) => handleInputChange('monthlyIncome', value)} />
              <InputField label="หนี้ต่อเดือนปัจจุบัน (existingDebtPerMonth)" value={inputs.existingDebtPerMonth} onChange={(value) => handleInputChange('existingDebtPerMonth', value)} />
              <InputField label="ดอกเบี้ยต่อปี % (annualInterestRate)" value={inputs.annualInterestRate} onChange={(value) => handleInputChange('annualInterestRate', value)} />
              <InputField label="ระยะเวลากู้ ปี (loanYears)" value={inputs.loanYears} onChange={(value) => handleInputChange('loanYears', value)} />
              <InputField label="เงินดาวน์ต่อหลัง (downPaymentPerHouse)" value={inputs.downPaymentPerHouse} onChange={(value) => handleInputChange('downPaymentPerHouse', value)} />
              <InputField label="ต้นทุนก่อสร้างต่อหลัง (constructionCostPerHouse)" value={inputs.constructionCostPerHouse} onChange={(value) => handleInputChange('constructionCostPerHouse', value)} />
              <InputField label="ค่าเช่าคาดหวังต่อหลัง (expectedRentPerHouse)" value={inputs.expectedRentPerHouse} onChange={(value) => handleInputChange('expectedRentPerHouse', value)} />
              <InputField label="ค่าใช้จ่ายดำเนินงานต่อหลัง (operatingCostPerHouse)" value={inputs.operatingCostPerHouse} onChange={(value) => handleInputChange('operatingCostPerHouse', value)} />
            </div>

            <div className="space-y-3 rounded-2xl border border-white/10 bg-slate-950/70 p-5">
              <CalcRow label="estimatedLoanCapacity" value={formatCurrency(metrics.estimatedLoanCapacity)} />
              <CalcRow label="monthlyInstallmentPerHouse" value={formatCurrency(metrics.monthlyInstallmentPerHouse)} />
              <CalcRow label="totalCashNeededPerHouse" value={formatCurrency(metrics.totalCashNeededPerHouse)} />
              <CalcRow label="netCashflowPerHouse" value={formatCurrency(metrics.netCashflowPerHouse)} />
              <CalcRow label="recommendedPhasePlan" value={metrics.recommendedPhasePlan} multiline />
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-7">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">Per House Economics</h3>
              <StatusBadge status={houseStatus} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <CalcRow label="totalInvestmentPerHouse" value={formatCurrency(metrics.constructionCostPerHouse)} />
              <CalcRow label="downPaymentPerHouse" value={formatCurrency(metrics.downPaymentPerHouse)} />
              <CalcRow label="loanAmountPerHouse" value={formatCurrency(metrics.loanAmountPerHouse)} />
              <CalcRow label="monthlyRent" value={formatCurrency(metrics.expectedRentPerHouse)} />
              <CalcRow label="monthlyInstallment" value={formatCurrency(metrics.monthlyInstallmentPerHouse)} />
              <CalcRow label="monthlyOperatingCost" value={formatCurrency(metrics.operatingCostPerHouse)} />
              <CalcRow label="netCashflowPerHouse" value={formatCurrency(metrics.netCashflowPerHouse)} />
            </div>
          </article>

          <article className="rounded-3xl border border-indigo-300/40 bg-gradient-to-br from-indigo-500/20 via-fuchsia-500/10 to-sky-500/10 p-6 md:p-7">
            <p className="text-xs uppercase tracking-[0.2em] text-indigo-100/90">12-House Vision</p>
            <h3 className="mt-2 text-3xl font-semibold text-white">Sweet Goal</h3>
            <div className="mt-5 space-y-3">
              <CalcRow label="grossRentalIncomePerMonth" value={formatCurrency(metrics.grossRentalIncomePerMonth)} />
              <CalcRow label="totalDebtServicePerMonth" value={formatCurrency(metrics.totalDebtServicePerMonth)} />
              <CalcRow label="totalOperatingCostPerMonth" value={formatCurrency(metrics.totalOperatingCostPerMonth)} />
              <CalcRow label="passiveIncomePerMonth" value={formatCurrency(metrics.passiveIncomePerMonth)} />
              <CalcRow label="passiveIncomePerYear" value={formatCurrency(metrics.passiveIncomePerYear)} />
            </div>
            <p className="mt-5 text-sm text-indigo-100/90">
              If all 12 houses are rented, this is the approximate monthly passive income.
            </p>
          </article>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
          <h3 className="text-2xl font-semibold text-white">Roadmap</h3>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {PHASES.map((phase, index) => (
              <article key={phase.title} className="rounded-2xl border border-white/10 bg-slate-950/55 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Phase {index + 1}</p>
                <h4 className="mt-1 text-base font-semibold text-white">{phase.title}</h4>
                <ul className="mt-3 space-y-2 text-sm text-slate-200">
                  {phase.checks.map((check) => (
                    <li key={check} className="flex items-start gap-2">
                      <span className="mt-0.5 text-emerald-300">✓</span>
                      <span>{check}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-2xl font-semibold text-white">House Plan Table</h3>
            <p className="text-sm text-slate-400">แผน 12 หลัง แบบค่อยเป็นค่อยไป</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-2 text-left text-sm">
              <thead>
                <tr className="text-slate-400">
                  <th className="px-3 py-2 font-medium">House</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Investment</th>
                  <th className="px-3 py-2 font-medium">Loan</th>
                  <th className="px-3 py-2 font-medium">Rent</th>
                  <th className="px-3 py-2 font-medium">Net / Month</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: TARGET_HOUSES }, (_, index) => {
                  const houseNumber = index + 1;
                  const status =
                    houseNumber === 1
                      ? 'Validate'
                      : houseNumber <= 4
                        ? 'Scale'
                        : houseNumber <= 8
                          ? 'Pipeline'
                          : 'Planned';

                  return (
                    <tr key={houseNumber} className="rounded-xl bg-slate-950/50 text-slate-200">
                      <td className="px-3 py-3 font-medium">House {houseNumber.toString().padStart(2, '0')}</td>
                      <td className="px-3 py-3">{status}</td>
                      <td className="px-3 py-3">{formatCurrency(metrics.constructionCostPerHouse)}</td>
                      <td className="px-3 py-3">{formatCurrency(metrics.loanAmountPerHouse)}</td>
                      <td className="px-3 py-3">{formatCurrency(metrics.expectedRentPerHouse)}</td>
                      <td className="px-3 py-3">{formatCurrency(metrics.netCashflowPerHouse)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </main>
  );
}

type InputFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

function InputField({ label, value, onChange }: InputFieldProps) {
  return (
    <label className="space-y-2">
      <span className="text-sm text-slate-300">{label}</span>
      <input
        type="number"
        inputMode="decimal"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-white/15 bg-slate-950/60 px-3 py-2.5 text-white outline-none transition focus:border-indigo-300/70"
      />
    </label>
  );
}

type HeroKpiProps = {
  label: string;
  value: string;
  helper: string;
};

function HeroKpi({ label, value, helper }: HeroKpiProps) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
      <p className="mt-1 text-sm text-slate-300">{helper}</p>
    </article>
  );
}

type CalcRowProps = {
  label: string;
  value: string;
  multiline?: boolean;
};

function CalcRow({ label, value, multiline = false }: CalcRowProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/40 px-3 py-2.5">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`mt-1 text-white ${multiline ? 'text-sm leading-relaxed' : 'text-base font-medium'}`}>{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: 'Profitable' | 'Break-even' | 'Negative cash flow' }) {
  const colorClass =
    status === 'Profitable'
      ? 'border-emerald-300/40 bg-emerald-300/15 text-emerald-100'
      : status === 'Break-even'
        ? 'border-amber-300/40 bg-amber-300/10 text-amber-100'
        : 'border-rose-300/40 bg-rose-300/10 text-rose-100';

  return <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${colorClass}`}>{status}</span>;
}
