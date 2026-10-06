import { Loan } from './loan';
import { emptyLoanFilter, matchesLoanFilter } from './loan-filter';

const loan: Loan = {
  id: 1,
  loanNumber: 'KR-2024-0001',
  borrower: 'Anna Schmidt',
  type: 'mortgage',
  amount: 320_000,
  outstandingBalance: 287_450,
  interestRate: 0.0365,
  termMonths: 300,
  monthlyPayment: 1_624.8,
  disbursementDate: '2024-02-15',
  status: 'active',
};

describe('matchesLoanFilter', () => {
  it('matches everything with the empty filter', () => {
    expect(matchesLoanFilter(loan, emptyLoanFilter)).toBe(true);
  });

  it('matches the borrower case-insensitively by substring', () => {
    expect(matchesLoanFilter(loan, { ...emptyLoanFilter, borrower: ' schmi ' })).toBe(true);
    expect(matchesLoanFilter(loan, { ...emptyLoanFilter, borrower: 'Weber' })).toBe(false);
  });

  it('restricts by type and status', () => {
    expect(matchesLoanFilter(loan, { ...emptyLoanFilter, types: ['car', 'mortgage'] })).toBe(true);
    expect(matchesLoanFilter(loan, { ...emptyLoanFilter, types: ['car'] })).toBe(false);
    expect(matchesLoanFilter(loan, { ...emptyLoanFilter, statuses: ['overdue'] })).toBe(false);
  });

  it('restricts by an inclusive amount range', () => {
    expect(matchesLoanFilter(loan, { ...emptyLoanFilter, minAmount: 320_000, maxAmount: 320_000 })).toBe(true);
    expect(matchesLoanFilter(loan, { ...emptyLoanFilter, minAmount: 320_001 })).toBe(false);
    expect(matchesLoanFilter(loan, { ...emptyLoanFilter, maxAmount: 319_999 })).toBe(false);
  });

  it('restricts by an inclusive disbursement period', () => {
    expect(matchesLoanFilter(loan, { ...emptyLoanFilter, disbursedFrom: '2024-02-15', disbursedTo: '2024-02-15' })).toBe(true);
    expect(matchesLoanFilter(loan, { ...emptyLoanFilter, disbursedFrom: '2024-02-16' })).toBe(false);
    expect(matchesLoanFilter(loan, { ...emptyLoanFilter, disbursedTo: '2024-02-14' })).toBe(false);
  });
});
