import { Loan } from './loan';
import { LoanFilter, emptyLoanFilter, matchesLoanFilter } from './loan-filter';

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

  it('combines all criteria with AND', () => {
    const loans: Loan[] = [
      { ...loan, id: 1, borrower: 'Markus Weber', type: 'car', status: 'active' },
      { ...loan, id: 2, borrower: 'Sophie Wagner', type: 'consumer', status: 'active' },
      { ...loan, id: 3, borrower: 'Lukas Schulz', type: 'car', status: 'overdue' },
      { ...loan, id: 4, borrower: 'Anna Schmidt', type: 'mortgage', status: 'active' },
    ];
    const filter: LoanFilter = { ...emptyLoanFilter, types: ['car', 'consumer'], statuses: ['active'] };

    const matches = loans.filter((candidate) => matchesLoanFilter(candidate, filter)).map((match) => match.borrower);

    expect(matches).toEqual(['Markus Weber', 'Sophie Wagner']);
  });

  it('matches nothing for a contradictory amount range', () => {
    const filter: LoanFilter = { ...emptyLoanFilter, minAmount: 300_000, maxAmount: 100_000 };

    expect(matchesLoanFilter(loan, filter)).toBe(false);
    expect(matchesLoanFilter({ ...loan, amount: 200_000 }, filter)).toBe(false);
  });
});
