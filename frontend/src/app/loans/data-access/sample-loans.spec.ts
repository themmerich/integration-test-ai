import { sampleLoans } from './sample-loans';

describe('sampleLoans', () => {
  it('contains twelve loans with unique ids and loan numbers', () => {
    expect(sampleLoans).toHaveLength(12);
    expect(new Set(sampleLoans.map((loan) => loan.id)).size).toBe(12);
    expect(new Set(sampleLoans.map((loan) => loan.loanNumber)).size).toBe(12);
  });

  it('never has an outstanding balance above the loan amount', () => {
    for (const loan of sampleLoans) {
      expect(loan.outstandingBalance, loan.loanNumber).toBeLessThanOrEqual(loan.amount);
    }
  });

  it('has no outstanding balance on repaid loans', () => {
    for (const loan of sampleLoans.filter((candidate) => candidate.status === 'repaid')) {
      expect(loan.outstandingBalance, loan.loanNumber).toBe(0);
    }
  });

  it('stores disbursement dates as valid ISO dates (YYYY-MM-DD)', () => {
    for (const loan of sampleLoans) {
      expect(loan.disbursementDate, loan.loanNumber).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(new Date(`${loan.disbursementDate}T00:00:00Z`).toISOString().slice(0, 10), loan.loanNumber).toBe(loan.disbursementDate);
    }
  });
});
