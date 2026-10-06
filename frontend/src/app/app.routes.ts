import { Routes } from '@angular/router';

export const routes: Routes = [
  // App shell (sidebar + top bar); every page renders inside its <router-outlet>.
  {
    path: '',
    loadComponent: () => import('./layout/feature/app-layout').then((m) => m.AppLayout),
    children: [
      // Start page: loan overview table, backed by static sample data for now.
      {
        path: '',
        loadChildren: () => import('./loans/shell/loans-routes').then((m) => m.loansRoutes),
      },
      // Demo route: smoke-tests the PrimeNG + Transloco + Tailwind wiring and the
      // Sheriff module structure (src/app/<scope>/<type>, see sheriff.config.ts).
      // When starting a real app from this template, delete the demo scope,
      // this route, and its keys in public/i18n/*.json.
      {
        path: 'demo',
        loadComponent: () => import('./demo/feature/primeng-test/primeng-test').then((m) => m.PrimeNgTest),
      },
    ],
  },
];
