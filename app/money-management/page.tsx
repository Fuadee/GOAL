'use client';

import { useMemo, useState } from 'react';

import { Navbar } from '@/components/navbar';

const TARGET_HOUSES = 12;
const PHASE_ORDER = ['planning', 'permit', 'financial', 'loan', 'construction', 'ready'] as const;

type PhaseName = (typeof PHASE_ORDER)[number];
type PhaseStatus = 'locked' | 'in_progress' | 'completed';
type ApprovalStatus = 'pending' | 'approved' | 'rejected';
type TaskStatus = 'todo' | 'done';

type HouseData = {
  id: number;
  location: string;
  designUploaded: boolean;
  permitStatus: ApprovalStatus;
  landCost: string;
  materialCost: string;
  laborCost: string;
  monthlyRent: string;
  monthlyOperatingCost: string;
  monthlyLoanPayment: string;
  loanAmount: string;
  approvedAmount: string;
  loanStatus: ApprovalStatus;
  constructionTasks: { title: string; status: TaskStatus }[];
  rentalReady: boolean;
  tenantAssigned: boolean;
};

type PhaseStatusRow = {
  house_id: number;
  phase_name: PhaseName;
  status: PhaseStatus;
  completed_at: string | null;
};

const defaultTasks = [
  { title: 'Foundation', status: 'todo' as const },
  { title: 'Structure', status: 'todo' as const },
  { title: 'Utilities + Finish', status: 'todo' as const }
];

const createInitialHouses = (): HouseData[] =>
  Array.from({ length: TARGET_HOUSES }, (_, index) => ({
    id: index + 1,
    location: '',
    designUploaded: false,
    permitStatus: 'pending',
    landCost: '',
    materialCost: '',
    laborCost: '',
    monthlyRent: '',
    monthlyOperatingCost: '',
    monthlyLoanPayment: '',
    loanAmount: '',
    approvedAmount: '',
    loanStatus: 'pending',
    constructionTasks: defaultTasks.map((task) => ({ ...task })),
    rentalReady: false,
    tenantAssigned: false
  }));

const parseNumber = (value: string): number | undefined => {
  if (!value.trim()) {
    return undefined;
  }
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : undefined;
};

const formatCurrency = (value?: number) => {
  if (value === undefined || Number.isNaN(value)) {
    return '—';
  }

  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
};

const getFinancialMetrics = (house: HouseData) => {
  const landCost = parseNumber(house.landCost);
  const materialCost = parseNumber(house.materialCost);
  const laborCost = parseNumber(house.laborCost);
  const monthlyRent = parseNumber(house.monthlyRent);
  const monthlyOperatingCost = parseNumber(house.monthlyOperatingCost);
  const monthlyLoanPayment = parseNumber(house.monthlyLoanPayment);

  const totalCost =
    landCost !== undefined && materialCost !== undefined && laborCost !== undefined ? landCost + materialCost + laborCost : undefined;

  const netCashflow =
    monthlyRent !== undefined && monthlyOperatingCost !== undefined && monthlyLoanPayment !== undefined
      ? monthlyRent - monthlyOperatingCost - monthlyLoanPayment
      : undefined;

  return { totalCost, netCashflow, landCost, materialCost, laborCost };
};

const getPhaseCompletion = (house: HouseData, phase: PhaseName): { completed: boolean; reasons: string[] } => {
  const financial = getFinancialMetrics(house);

  switch (phase) {
    case 'planning': {
      const reasons = [
        ...(house.location.trim() ? [] : ['Location is required']),
        ...(house.designUploaded ? [] : ['Design file must be uploaded'])
      ];
      return { completed: reasons.length === 0, reasons };
    }
    case 'permit': {
      const reasons = house.permitStatus === 'approved' ? [] : ['Permit status must be approved'];
      return { completed: reasons.length === 0, reasons };
    }
    case 'financial': {
      const reasons = [
        ...(financial.landCost !== undefined ? [] : ['Land cost is required']),
        ...(financial.materialCost !== undefined ? [] : ['Material cost is required']),
        ...(financial.laborCost !== undefined ? [] : ['Labor cost is required']),
        ...(financial.totalCost !== undefined ? [] : ['total_cost could not be calculated']),
        ...(financial.netCashflow !== undefined ? [] : ['net_cashflow could not be calculated'])
      ];
      return { completed: reasons.length === 0, reasons };
    }
    case 'loan': {
      const loanAmount = parseNumber(house.loanAmount);
      const approvedAmount = parseNumber(house.approvedAmount);
      const reasons = [
        ...(house.loanStatus === 'approved' ? [] : ['Loan status must be approved']),
        ...(loanAmount !== undefined ? [] : ['loan_amount is required']),
        ...(approvedAmount !== undefined ? [] : ['approved_amount is required']),
        ...(loanAmount !== undefined && approvedAmount !== undefined && approvedAmount >= loanAmount
          ? []
          : ['approved_amount must be greater than or equal to loan_amount'])
      ];
      return { completed: reasons.length === 0, reasons };
    }
    case 'construction': {
      const allDone = house.constructionTasks.every((task) => task.status === 'done');
      return { completed: allDone, reasons: allDone ? [] : ['All construction tasks must be done'] };
    }
    case 'ready': {
      const complete = house.rentalReady || house.tenantAssigned;
      return { completed: complete, reasons: complete ? [] : ['Mark rental ready or assign tenant'] };
    }
  }
};

const getFirstIncompletePhaseIndex = (house: HouseData) => {
  for (let i = 0; i < PHASE_ORDER.length; i += 1) {
    if (!getPhaseCompletion(house, PHASE_ORDER[i]).completed) {
      return i;
    }
  }
  return PHASE_ORDER.length - 1;
};

const getPhaseStatus = (house: HouseData, phaseIndex: number): PhaseStatus => {
  const firstIncomplete = getFirstIncompletePhaseIndex(house);
  if (phaseIndex < firstIncomplete) {
    return 'completed';
  }
  if (phaseIndex === firstIncomplete) {
    return getPhaseCompletion(house, PHASE_ORDER[phaseIndex]).completed ? 'completed' : 'in_progress';
  }
  return 'locked';
};

const getCurrentPhase = (house: HouseData): PhaseName => PHASE_ORDER[getFirstIncompletePhaseIndex(house)];

const canAccessPhase = (houses: HouseData[], house: HouseData, phaseIndex: number, strictMode: boolean) => {
  if (phaseIndex === 0) {
    return { unlocked: true, reason: '' };
  }

  const previousPhase = PHASE_ORDER[phaseIndex - 1];
  const previousCompletion = getPhaseCompletion(house, previousPhase);
  if (!previousCompletion.completed) {
    return {
      unlocked: false,
      reason: `House ${house.id} is locked because ${previousPhase} is incomplete: ${previousCompletion.reasons.join(', ')}`
    };
  }

  if (strictMode) {
    const blockingHouse = houses.find((candidate) => !getPhaseCompletion(candidate, previousPhase).completed);
    if (blockingHouse) {
      return {
        unlocked: false,
        reason: `Strict mode: all houses must complete ${previousPhase}. House ${blockingHouse.id} is still in progress.`
      };
    }
  }

  return { unlocked: true, reason: '' };
};

export default function MoneyManagementPage() {
  const [houses, setHouses] = useState<HouseData[]>(() => createInitialHouses());
  const [selectedHouseId, setSelectedHouseId] = useState(1);
  const [strictMode, setStrictMode] = useState(false);

  const selectedHouse = houses.find((house) => house.id === selectedHouseId) ?? houses[0];

  const updateSelectedHouse = (updater: (house: HouseData) => HouseData) => {
    setHouses((prev) => prev.map((house) => (house.id === selectedHouseId ? updater(house) : house)));
  };

  const pipeline = useMemo(() => {
    const grouped = Object.fromEntries(PHASE_ORDER.map((phase) => [phase, [] as HouseData[]])) as Record<PhaseName, HouseData[]>;
    houses.forEach((house) => {
      grouped[getCurrentPhase(house)].push(house);
    });
    return grouped;
  }, [houses]);

  const housePhaseStatuses = useMemo<PhaseStatusRow[]>(() => {
    return houses.flatMap((house) =>
      PHASE_ORDER.map((phase, index) => {
        const status = getPhaseStatus(house, index);
        return {
          house_id: house.id,
          phase_name: phase,
          status,
          completed_at: status === 'completed' ? new Date().toISOString() : null
        };
      })
    );
  }, [houses]);

  const selectedFinancial = getFinancialMetrics(selectedHouse);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <Navbar />

      <section className="mx-auto w-full max-w-7xl space-y-8 px-6 py-10 md:px-10">
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-indigo-200/70">Execution Control System</p>
          <h1 className="text-4xl font-semibold text-white">Parallel Project Execution with Phase Lock</h1>
          <p className="max-w-4xl text-slate-300">
            All houses follow strict phase order: planning → permit → financial → loan → construction → ready.
          </p>
        </header>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <label className="flex items-center gap-3 text-sm text-white">
            <input type="checkbox" checked={strictMode} onChange={(event) => setStrictMode(event.target.checked)} />
            Enable strict mode (block next phase globally until all houses complete current phase)
          </label>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_1.5fr]">
          <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="text-xl font-semibold text-white">Pipeline View (12 Houses)</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {PHASE_ORDER.map((phase) => (
                <div key={phase} className="rounded-xl border border-white/10 bg-slate-950/60 p-3">
                  <p className="text-xs uppercase text-slate-400">{phase}</p>
                  <p className="text-lg font-semibold text-white">{pipeline[phase].length} houses</p>
                  <p className="mt-1 text-xs text-slate-400">{pipeline[phase].map((house) => `#${house.id}`).join(', ') || '—'}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-white">House Execution Panel</h2>
              <select
                value={selectedHouseId}
                onChange={(event) => setSelectedHouseId(Number(event.target.value))}
                className="rounded-lg border border-white/20 bg-slate-950 px-3 py-1.5 text-white"
              >
                {houses.map((house) => (
                  <option key={house.id} value={house.id}>
                    House {house.id.toString().padStart(2, '0')}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
              {PHASE_ORDER.map((phase, index) => {
                const status = getPhaseStatus(selectedHouse, index);
                const access = canAccessPhase(houses, selectedHouse, index, strictMode);
                const completion = getPhaseCompletion(selectedHouse, phase);

                return (
                  <div key={phase} className="rounded-xl border border-white/10 bg-slate-950/60 p-3 text-sm text-slate-200">
                    <p className="font-semibold text-white">
                      {status === 'locked' ? '🔒' : status === 'completed' ? '✅' : '🟡'} {phase}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">status: {status}</p>
                    {!access.unlocked ? <p className="mt-2 text-xs text-rose-300">{access.reason}</p> : null}
                    {!completion.completed ? <p className="mt-2 text-xs text-amber-200">{completion.reasons.join(', ')}</p> : null}
                  </div>
                );
              })}
            </div>
          </article>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <h3 className="text-lg font-semibold text-white">Completion Criteria Input (Selected House)</h3>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <InputField label="planning.location" value={selectedHouse.location} onChange={(value) => updateSelectedHouse((house) => ({ ...house, location: value }))} />
            <ToggleField
              label="planning.design_file_uploaded"
              checked={selectedHouse.designUploaded}
              onChange={(checked) => updateSelectedHouse((house) => ({ ...house, designUploaded: checked }))}
            />

            <SelectField
              label="permit.status"
              value={selectedHouse.permitStatus}
              options={['pending', 'approved', 'rejected']}
              onChange={(value) => updateSelectedHouse((house) => ({ ...house, permitStatus: value as ApprovalStatus }))}
            />

            <InputField label="financial.land_cost" value={selectedHouse.landCost} onChange={(value) => updateSelectedHouse((house) => ({ ...house, landCost: value }))} />
            <InputField label="financial.material_cost" value={selectedHouse.materialCost} onChange={(value) => updateSelectedHouse((house) => ({ ...house, materialCost: value }))} />
            <InputField label="financial.labor_cost" value={selectedHouse.laborCost} onChange={(value) => updateSelectedHouse((house) => ({ ...house, laborCost: value }))} />
            <InputField label="financial.monthly_rent" value={selectedHouse.monthlyRent} onChange={(value) => updateSelectedHouse((house) => ({ ...house, monthlyRent: value }))} />
            <InputField
              label="financial.monthly_operating_cost"
              value={selectedHouse.monthlyOperatingCost}
              onChange={(value) => updateSelectedHouse((house) => ({ ...house, monthlyOperatingCost: value }))}
            />
            <InputField
              label="financial.monthly_loan_payment"
              value={selectedHouse.monthlyLoanPayment}
              onChange={(value) => updateSelectedHouse((house) => ({ ...house, monthlyLoanPayment: value }))}
            />

            <InputField label="loan.loan_amount" value={selectedHouse.loanAmount} onChange={(value) => updateSelectedHouse((house) => ({ ...house, loanAmount: value }))} />
            <InputField
              label="loan.approved_amount"
              value={selectedHouse.approvedAmount}
              onChange={(value) => updateSelectedHouse((house) => ({ ...house, approvedAmount: value }))}
            />
            <SelectField
              label="loan.status"
              value={selectedHouse.loanStatus}
              options={['pending', 'approved', 'rejected']}
              onChange={(value) => updateSelectedHouse((house) => ({ ...house, loanStatus: value as ApprovalStatus }))}
            />

            <ToggleField
              label="ready.rental_ready"
              checked={selectedHouse.rentalReady}
              onChange={(checked) => updateSelectedHouse((house) => ({ ...house, rentalReady: checked }))}
            />
            <ToggleField
              label="ready.tenant_assigned"
              checked={selectedHouse.tenantAssigned}
              onChange={(checked) => updateSelectedHouse((house) => ({ ...house, tenantAssigned: checked }))}
            />
          </div>

          <div className="mt-4 rounded-xl border border-indigo-300/30 bg-indigo-500/10 p-3 text-sm text-indigo-100">
            Calculated financials → total_cost: {formatCurrency(selectedFinancial.totalCost)} | net_cashflow: {formatCurrency(selectedFinancial.netCashflow)}
          </div>

          <div className="mt-4 space-y-2">
            <p className="text-sm text-slate-300">construction.tasks</p>
            {selectedHouse.constructionTasks.map((task, index) => {
              const access = canAccessPhase(houses, selectedHouse, PHASE_ORDER.indexOf('construction'), strictMode);
              const disabled = !access.unlocked;

              return (
                <button
                  key={task.title}
                  type="button"
                  disabled={disabled}
                  onClick={() =>
                    updateSelectedHouse((house) => ({
                      ...house,
                      constructionTasks: house.constructionTasks.map((current, currentIndex) =>
                        currentIndex === index ? { ...current, status: current.status === 'done' ? 'todo' : 'done' } : current
                      )
                    }))
                  }
                  className="mr-2 rounded-lg border border-white/20 px-3 py-1.5 text-sm text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {task.status === 'done' ? '✅' : '⬜'} {task.title}
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <h3 className="text-lg font-semibold text-white">house_phase_status Preview</h3>
          <div className="mt-3 max-h-80 overflow-auto rounded-lg border border-white/10">
            <table className="min-w-full text-left text-xs text-slate-200">
              <thead className="bg-slate-900 text-slate-400">
                <tr>
                  <th className="px-2 py-2">house_id</th>
                  <th className="px-2 py-2">phase_name</th>
                  <th className="px-2 py-2">status</th>
                  <th className="px-2 py-2">completed_at</th>
                </tr>
              </thead>
              <tbody>
                {housePhaseStatuses.map((row) => (
                  <tr key={`${row.house_id}-${row.phase_name}`} className="border-t border-white/10">
                    <td className="px-2 py-1">{row.house_id}</td>
                    <td className="px-2 py-1">{row.phase_name}</td>
                    <td className="px-2 py-1">{row.status}</td>
                    <td className="px-2 py-1">{row.completed_at ?? 'null'}</td>
                  </tr>
                ))}
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
    <label className="space-y-1">
      <span className="text-xs text-slate-300">{label}</span>
      <input
        type="number"
        inputMode="decimal"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-white/20 bg-slate-950 px-3 py-2 text-white"
      />
    </label>
  );
}

function ToggleField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex items-center justify-between rounded-lg border border-white/10 bg-slate-950/70 px-3 py-2 text-xs text-slate-200">
      {label}
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="space-y-1">
      <span className="text-xs text-slate-300">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-lg border border-white/20 bg-slate-950 px-3 py-2 text-white">
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
