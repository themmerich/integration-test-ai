import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslocoTestingModule } from '@jsverse/transloco';

import { AppLayout } from './app-layout';

const en = {
  layout: {
    appName: 'Integration Test AI',
    mainNavigation: 'Main navigation',
    toggleMenu: 'Toggle menu',
    user: 'Demo user',
    nav: { lending: 'Lending', loanOverview: 'Loan overview', development: 'Development', primengDemo: 'PrimeNG demo' },
  },
};

describe('AppLayout', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AppLayout,
        TranslocoTestingModule.forRoot({
          langs: { en },
          translocoConfig: { availableLangs: ['en'], defaultLang: 'en' },
          preloadLangs: true,
        }),
      ],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  function render(): HTMLElement {
    const fixture = TestBed.createComponent(AppLayout);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('renders the grouped navigation with links to all pages', () => {
    const element = render();
    const links = Array.from(element.querySelectorAll('nav a'));

    expect(element.textContent).toContain('Lending');
    expect(element.textContent).toContain('Development');
    expect(links.map((link) => [link.textContent?.trim(), link.getAttribute('href')])).toEqual([
      ['Loan overview', '/'],
      ['PrimeNG demo', '/demo'],
    ]);
  });

  it('renders the page content area with a router outlet', () => {
    expect(render().querySelector('main router-outlet')).toBeTruthy();
  });
});
