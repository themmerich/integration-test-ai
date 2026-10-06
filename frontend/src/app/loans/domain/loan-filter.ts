import { Loan, LoanStatus, LoanType } from './loan';

/** Criteria from the loan search form. Empty values (`''`, `[]`, `null`) mean "no restriction". Dates are ISO `YYYY-MM-DD`. */
export type LoanFilter = {
  borrower: string;
  types: LoanType[];
  statuses: LoanStatus[];
  minAmount: number | null;
  maxAmount: number | null;
  disbursedFrom: string | null;
  disbursedTo: string | null;
};

export const emptyLoanFilter: LoanFilter = {
  borrower: '',
  types: [],
  statuses: [],
  minAmount: null,
  maxAmount: null,
  disbursedFrom: null,
  disbursedTo: null,
};

export function matchesLoanFilter(loan: Loan, filter: LoanFilter): boolean {
  const borrower = filter.borrower.trim().toLowerCase();
  return (
    (borrower === '' || loan.borrower.toLowerCase().includes(borrower)) &&
    (filter.types.length === 0 || filter.types.includes(loan.type)) &&
    (filter.statuses.length === 0 || filter.statuses.includes(loan.status)) &&
    (filter.minAmount === null || loan.amount >= filter.minAmount) &&
    (filter.maxAmount === null || loan.amount <= filter.maxAmount) &&
    (filter.disbursedFrom === null || loan.disbursementDate >= filter.disbursedFrom) &&
    (filter.disbursedTo === null || loan.disbursementDate <= filter.disbursedTo)
  );
}
