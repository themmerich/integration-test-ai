import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslocoTestingModule } from '@jsverse/transloco';

import de from '../../../../public/i18n/de.json';
import { AppLayout } from './app-layout';

describe('AppLayout', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AppLayout,
        TranslocoTestingModule.forRoot({
          langs: { de },
          translocoConfig: { availableLangs: ['de'], defaultLang: 'de' },
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

    expect(element.textContent).toContain('Kreditgeschäft');
    expect(links.map((link) => [link.textContent?.trim(), link.getAttribute('href')])).toEqual([['Kreditübersicht', '/']]);
  });

  it('renders the page content area with a router outlet', () => {
    expect(render().querySelector('main router-outlet')).toBeTruthy();
  });
});
