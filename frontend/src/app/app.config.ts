import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideTransloco } from '@jsverse/transloco';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';

import { routes } from './app.routes';
import { environment } from '../environments/environment';
import { primengTranslation } from './primeng-translation';
import { TranslocoHttpLoader } from './transloco-loader';

// The app is German only, so the currency, percent and date pipes format with the German locale.
registerLocaleData(localeDe);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
    { provide: LOCALE_ID, useValue: 'de-DE' },
    provideTransloco({
      config: {
        availableLangs: ['de'],
        defaultLang: 'de',
        fallbackLang: 'de',
        prodMode: environment.production,
      },
      loader: TranslocoHttpLoader,
    }),
    providePrimeNG({
      license: environment.primengLicense,
      translation: primengTranslation,
      theme: {
        preset: Aura,
        options: {
          cssLayer: {
            name: 'primeng',
            order: 'theme, base, primeng, components, utilities',
          },
        },
      },
    }),
  ],
};
