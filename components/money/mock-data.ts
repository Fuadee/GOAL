import { RentalHouse } from './types';

export const initialRentalHouses: RentalHouse[] = [
  {
    id: 'house-01',
    name: 'House 01',
    targetOrder: 1,
    currentStage: 'loan_approved',
    budget: 2800000,
    loanAmount: 2200000,
    approvedAmount: 2100000,
    monthlyInstallment: 18500,
    monthlyRent: 0,
    monthlyExpense: 4500,
    netCashFlow: -23000,
    startDate: '2026-01-12',
    targetCompleteDate: '2026-10-30',
    note: 'Pre-construction phase with contractor shortlist finalized.',
    lender: 'Bangkok Premier Bank',
    loanSubmittedDate: '2026-02-03'
  },
  {
    id: 'house-02',
    name: 'House 02',
    targetOrder: 2,
    currentStage: 'under_construction',
    budget: 3000000,
    loanAmount: 2400000,
    approvedAmount: 2300000,
    monthlyInstallment: 19800,
    monthlyRent: 0,
    monthlyExpense: 5200,
    netCashFlow: -25000,
    startDate: '2025-11-08',
    targetCompleteDate: '2026-08-15',
    note: 'Structure complete 65%, interior works next.',
    lender: 'Siam Housing Finance',
    loanSubmittedDate: '2025-11-20'
  },
  {
    id: 'house-03',
    name: 'House 03',
    targetOrder: 3,
    currentStage: 'rented',
    budget: 2950000,
    loanAmount: 2350000,
    approvedAmount: 2350000,
    monthlyInstallment: 20100,
    monthlyRent: 34000,
    monthlyExpense: 5500,
    netCashFlow: 8400,
    startDate: '2025-03-05',
    targetCompleteDate: '2025-12-18',
    note: 'Tenant signed 12-month lease. Tracking maintenance reserve.',
    lender: 'Krung Capital Bank',
    loanSubmittedDate: '2025-03-28'
  }
];
