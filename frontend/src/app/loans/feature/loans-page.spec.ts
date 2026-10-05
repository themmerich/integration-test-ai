import { TestBed } from '@angular/core/testing';
import { TranslocoTestingModule } from '@jsverse/transloco';

import { sampleLoans } from '../data-access/sample-loans';
import { LoansPage } from './loans-page';

const en = {
  loans: {
    title: 'Loans',
    columns: {
      loanNumber: 'Loan no.',
      borrower: 'Borrower',
      type: 'Type',
      amount: 'Amount',
      outstandingBalance: 'Outstanding',
      interestRate: 'Interest rate',
      termMonths: 'Term (months)',
      monthlyPayment: 'Monthly payment',
      disbursementDate: 'Disbursed on',
      status: 'Status',
    },
    types: { mortgage: 'Mortgage', consumer: 'Consumer loan', car: 'Car loan', business: 'Business loan' },
    statuses: { requested: 'Requested', active: 'Active', overdue: 'Overdue', repaid: 'Repaid' },
    toolbar: { columns: 'Columns', selectedColumns: '{0} columns', search: 'Search loans', exportCsv: 'CSV' },
  },
};

describe('LoansPage', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        LoansPage,
        TranslocoTestingModule.forRoot({
          langs: { en },
          translocoConfig: { availableLangs: ['en'], defaultLang: 'en' },
          preloadLangs: true,
        }),
      ],
    }).compileComponents();
  });

  function render(): HTMLElement {
    const fixture = TestBed.createComponent(LoansPage);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('renders ten resizable columns', () => {
    const headers = render().querySelectorAll('thead th');

    expect(headers.length).toBe(10);
    expect(headers[1].textContent).toContain('Borrower');
    expect(headers[1].querySelector('.p-datatable-column-resizer')).toBeTruthy();
  });

  it('shows the first page of sample loans with translated labels', () => {
    const element = render();

    expect(element.querySelectorAll('tbody tr').length).toBe(10);
    expect(element.textContent).toContain(sampleLoans[0].borrower);
    expect(element.textContent).toContain('Mortgage');
    expect(element.textContent).toContain('Active');
  });

  it('renders the toolbar with column toggle, search and CSV export', () => {
    const toolbar = render().querySelector('p-toolbar') as HTMLElement;

    expect(toolbar.querySelector('p-multiselect')).toBeTruthy();
    expect(toolbar.querySelector('input[type="search"]')).toBeTruthy();
    expect(toolbar.textContent).toContain('CSV');
  });
});
