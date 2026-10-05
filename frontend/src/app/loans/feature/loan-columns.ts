import { Loan, LoanStatus, LoanType } from '../domain/loan';

/** A loan prepared for the table: translated labels make type and status searchable, sortable and exportable as text. */
export type LoanRow = Loan & {
  typeLabel: string;
  statusLabel: string;
  statusSeverity: 'info' | 'success' | 'danger' | 'secondary';
};

export type LoanColumnKey = keyof Loan & keyof LoanTranslations['columns'];

export type LoanColumn = {
  /** Translation key under `loans.columns`. */
  key: LoanColumnKey;
  /** Row field the column shows, sorts, filters and exports. */
  field: keyof LoanRow;
  format: 'code' | 'text' | 'currency' | 'percent' | 'number' | 'date' | 'status';
  isNumeric: boolean;
};

export type LoanTranslations = {
  columns: Record<
    | 'loanNumber'
    | 'borrower'
    | 'type'
    | 'amount'
    | 'outstandingBalance'
    | 'interestRate'
    | 'termMonths'
    | 'monthlyPayment'
    | 'disbursementDate'
    | 'status',
    string
  >;
  types: Record<LoanType, string>;
  statuses: Record<LoanStatus, string>;
};

export const loanColumns: LoanColumn[] = [
  { key: 'loanNumber', field: 'loanNumber', format: 'code', isNumeric: false },
  { key: 'borrower', field: 'borrower', format: 'text', isNumeric: false },
  { key: 'type', field: 'typeLabel', format: 'text', isNumeric: false },
  { key: 'amount', field: 'amount', format: 'currency', isNumeric: true },
  { key: 'outstandingBalance', field: 'outstandingBalance', format: 'currency', isNumeric: true },
  { key: 'interestRate', field: 'interestRate', format: 'percent', isNumeric: true },
  { key: 'termMonths', field: 'termMonths', format: 'number', isNumeric: true },
  { key: 'monthlyPayment', field: 'monthlyPayment', format: 'currency', isNumeric: true },
  { key: 'disbursementDate', field: 'disbursementDate', format: 'date', isNumeric: false },
  { key: 'status', field: 'statusLabel', format: 'status', isNumeric: false },
];

const statusSeverities: Record<LoanStatus, LoanRow['statusSeverity']> = {
  requested: 'info',
  active: 'success',
  overdue: 'danger',
  repaid: 'secondary',
};

export function toLoanRow(loan: Loan, translations: LoanTranslations): LoanRow {
  return {
    ...loan,
    typeLabel: translations.types[loan.type],
    statusLabel: translations.statuses[loan.status],
    statusSeverity: statusSeverities[loan.status],
  };
}
