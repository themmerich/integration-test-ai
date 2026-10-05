import { Routes } from '@angular/router';

export const loansRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('../feature/loans-page').then((m) => m.LoansPage),
  },
];
