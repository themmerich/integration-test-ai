import { TestBed } from '@angular/core/testing';
import { TranslocoTestingModule } from '@jsverse/transloco';

import de from '../../../../public/i18n/de.json';
import { sampleLoans } from '../data-access/sample-loans';
import { LoansPage } from './loans-page';

describe('LoansPage', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        LoansPage,
        TranslocoTestingModule.forRoot({
          langs: { de },
          translocoConfig: { availableLangs: ['de'], defaultLang: 'de' },
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
    expect(headers[1].textContent).toContain('Kreditnehmer');
    expect(headers[1].querySelector('.p-datatable-column-resizer')).toBeTruthy();
  });

  it('shows the first page of sample loans with translated labels', () => {
    const element = render();

    expect(element.querySelectorAll('tbody tr').length).toBe(10);
    expect(element.textContent).toContain(sampleLoans[0].borrower);
    expect(element.textContent).toContain('Baufinanzierung');
    expect(element.textContent).toContain('Aktiv');
  });

  it('renders the toolbar with column toggle, search and CSV export', () => {
    const toolbar = render().querySelector('p-toolbar') as HTMLElement;

    expect(toolbar.querySelector('p-multiselect')).toBeTruthy();
    expect(toolbar.querySelector('input[type="search"]')).toBeTruthy();
    expect(toolbar.textContent).toContain('CSV');
  });
});
