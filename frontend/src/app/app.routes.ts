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
    ],
  },
];
