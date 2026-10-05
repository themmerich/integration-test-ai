import { CurrencyPipe, DatePipe, PercentPipe } from '@angular/common';
import { Component } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

import { sampleLoans } from '../data-access/sample-loans';
import { LoanStatus } from '../domain/loan';

const statusSeverities: Record<LoanStatus, 'info' | 'success' | 'danger' | 'secondary'> = {
  requested: 'info',
  active: 'success',
  overdue: 'danger',
  repaid: 'secondary',
};

@Component({
  selector: 'app-loans-page',
  imports: [CurrencyPipe, DatePipe, PercentPipe, TranslocoDirective, CardModule, TableModule, TagModule],
  template: `
    <main class="mx-auto flex min-h-dvh max-w-screen-2xl flex-col gap-6 p-6">
      <ng-container *transloco="let t">
        <p-card [header]="t('loans.title')">
          <p-table
            dataKey="id"
            [value]="loans"
            [paginator]="true"
            [rows]="10"
            [rowHover]="true"
            [stripedRows]="true"
            [scrollable]="true"
            [tableStyle]="{ 'min-width': '80rem' }"
          >
            <ng-template #header>
              <tr>
                <th pSortableColumn="loanNumber">{{ t('loans.columns.loanNumber') }} <p-sort-icon field="loanNumber" /></th>
                <th pSortableColumn="borrower">{{ t('loans.columns.borrower') }} <p-sort-icon field="borrower" /></th>
                <th pSortableColumn="type">{{ t('loans.columns.type') }} <p-sort-icon field="type" /></th>
                <th pSortableColumn="amount" class="text-right">{{ t('loans.columns.amount') }} <p-sort-icon field="amount" /></th>
                <th pSortableColumn="outstandingBalance" class="text-right">
                  {{ t('loans.columns.outstandingBalance') }} <p-sort-icon field="outstandingBalance" />
                </th>
                <th pSortableColumn="interestRate" class="text-right">
                  {{ t('loans.columns.interestRate') }} <p-sort-icon field="interestRate" />
                </th>
                <th pSortableColumn="termMonths" class="text-right">
                  {{ t('loans.columns.termMonths') }} <p-sort-icon field="termMonths" />
                </th>
                <th pSortableColumn="monthlyPayment" class="text-right">
                  {{ t('loans.columns.monthlyPayment') }} <p-sort-icon field="monthlyPayment" />
                </th>
                <th pSortableColumn="disbursementDate">
                  {{ t('loans.columns.disbursementDate') }} <p-sort-icon field="disbursementDate" />
                </th>
                <th pSortableColumn="status">{{ t('loans.columns.status') }} <p-sort-icon field="status" /></th>
              </tr>
            </ng-template>

            <ng-template #body let-loan>
              <tr>
                <td class="font-mono whitespace-nowrap">{{ loan.loanNumber }}</td>
                <td>{{ loan.borrower }}</td>
                <td>{{ t('loans.types.' + loan.type) }}</td>
                <td class="text-right">{{ loan.amount | currency: 'EUR' }}</td>
                <td class="text-right">{{ loan.outstandingBalance | currency: 'EUR' }}</td>
                <td class="text-right">{{ loan.interestRate | percent: '1.2-2' }}</td>
                <td class="text-right">{{ loan.termMonths }}</td>
                <td class="text-right">{{ loan.monthlyPayment | currency: 'EUR' }}</td>
                <td>{{ loan.disbursementDate | date: 'mediumDate' }}</td>
                <td><p-tag [value]="t('loans.statuses.' + loan.status)" [severity]="loan.statusSeverity" /></td>
              </tr>
            </ng-template>

            <ng-template #emptymessage>
              <tr>
                <td colspan="10">{{ t('loans.empty') }}</td>
              </tr>
            </ng-template>
          </p-table>
        </p-card>
      </ng-container>
    </main>
  `,
})
export class LoansPage {
  // The tag colour is resolved up front: PrimeNG row templates are untyped, so a lookup in the template would not compile.
  protected readonly loans = sampleLoans.map((loan) => ({ ...loan, statusSeverity: statusSeverities[loan.status] }));
}
