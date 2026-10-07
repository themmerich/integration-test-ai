import de from '../../../../public/i18n/de.json';
import en from '../../../../public/i18n/en.json';
import { Loan, LoanStatus } from '../domain/loan';
import { LoanTranslations, loanColumns, toLoanRow } from './loan-columns';

// Typed assignment: the build fails if a loan type or status label is missing in either language.
const translations: Record<'en' | 'de', LoanTranslations> = { en: en.loans, de: de.loans };

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

describe('toLoanRow', () => {
  it('adds the translated type and status labels', () => {
    expect(toLoanRow(loan, translations.en)).toMatchObject({ typeLabel: 'Mortgage', statusLabel: 'Active' });
    expect(toLoanRow(loan, translations.de)).toMatchObject({ typeLabel: 'Baufinanzierung', statusLabel: 'Aktiv' });
  });

  it('maps every status to its tag severity', () => {
    const severities = (['requested', 'active', 'overdue', 'repaid'] as LoanStatus[]).map(
      (status) => toLoanRow({ ...loan, status }, translations.en).statusSeverity,
    );

    expect(severities).toEqual(['info', 'success', 'danger', 'secondary']);
  });

  it('keeps all loan fields unchanged', () => {
    const { typeLabel, statusLabel, statusSeverity, ...loanFields } = toLoanRow(loan, translations.en);

    expect(loanFields).toEqual(loan);
    expect([typeLabel, statusLabel, statusSeverity]).toEqual(['Mortgage', 'Active', 'success']);
  });
});

describe('loanColumns', () => {
  it('defines the ten columns in display order with unique keys', () => {
    const keys = loanColumns.map((column) => column.key);

    expect(keys).toEqual([
      'loanNumber',
      'borrower',
      'type',
      'amount',
      'outstandingBalance',
      'interestRate',
      'termMonths',
      'monthlyPayment',
      'disbursementDate',
      'status',
    ]);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('right-aligns exactly the number columns', () => {
    for (const column of loanColumns) {
      expect(column.isNumeric, column.key).toBe(['currency', 'percent', 'number'].includes(column.format));
    }
  });

  it('shows, sorts and exports type and status by their translated labels', () => {
    const fieldByKey = Object.fromEntries(loanColumns.map((column) => [column.key, column.field]));

    expect(fieldByKey['type']).toBe('typeLabel');
    expect(fieldByKey['status']).toBe('statusLabel');
  });
});
