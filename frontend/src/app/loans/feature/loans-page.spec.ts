import { TestBed } from '@angular/core/testing';
import { TranslocoTestingModule } from '@jsverse/transloco';

import { sampleLoans } from '../data-access/sample-loans';
import { LoansPage } from './loans-page';

const en = {
  loans: {
    title: 'Loans',
    columns: { borrower: 'Borrower', status: 'Status' },
    statuses: { active: 'Active' },
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

  it('renders ten sortable columns', () => {
    const headers = render().querySelectorAll('thead th');

    expect(headers.length).toBe(10);
    expect(headers[1].textContent).toContain('Borrower');
  });

  it('shows the first page of sample loans', () => {
    const element = render();

    expect(element.querySelectorAll('tbody tr').length).toBe(10);
    expect(element.textContent).toContain(sampleLoans[0].borrower);
    expect(element.textContent).toContain('Active');
  });
});
