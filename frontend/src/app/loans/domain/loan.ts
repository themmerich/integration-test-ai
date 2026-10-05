export type LoanType = 'mortgage' | 'consumer' | 'car' | 'business';

export type LoanStatus = 'requested' | 'active' | 'overdue' | 'repaid';

/** A loan as shown in the loan overview. Amounts are in EUR, `interestRate` is a fraction (0.0375 = 3.75 %). */
export type Loan = {
  id: number;
  loanNumber: string;
  borrower: string;
  type: LoanType;
  amount: number;
  outstandingBalance: number;
  interestRate: number;
  termMonths: number;
  monthlyPayment: number;
  disbursementDate: string;
  status: LoanStatus;
};
