import { CurrencyPipe, DatePipe, PercentPipe } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormField, form } from '@angular/forms/signals';
import { TranslocoDirective, translateObjectSignal } from '@jsverse/transloco';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { FieldsetModule } from 'primeng/fieldset';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';

import { sampleLoans } from '../data-access/sample-loans';
import { LoanFilter, emptyLoanFilter, matchesLoanFilter } from '../domain/loan-filter';
import { LoanColumnKey, LoanTranslations, loanColumns, toLoanRow } from './loan-columns';
import { LoanFilterForm } from './loan-filter-form';

@Component({
  selector: 'app-loans-page',
  imports: [
    CurrencyPipe,
    DatePipe,
    PercentPipe,
    FormField,
    TranslocoDirective,
    ButtonModule,
    CardModule,
    FieldsetModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    MultiSelectModule,
    TableModule,
    TagModule,
    ToolbarModule,
    LoanFilterForm,
  ],
  template: `
    <main class="mx-auto flex min-h-dvh max-w-screen-2xl flex-col gap-6 p-6">
      <ng-container *transloco="let t">
        <p-card [header]="t('loans.title')">
          <div class="flex flex-col gap-4">
            <p-fieldset [legend]="t('loans.filter.title')" [toggleable]="true">
              <app-loan-filter-form (filterChange)="onFilterChange($event)" />
            </p-fieldset>

            <p-toolbar>
              <ng-template #start>
                <p-multiselect
                  optionLabel="header"
                  optionValue="key"
                  [options]="columnOptions()"
                  [formField]="columnForm.visibleKeys"
                  [maxSelectedLabels]="0"
                  [selectedItemsLabel]="t('loans.toolbar.selectedColumns')"
                  [placeholder]="t('loans.toolbar.columns')"
                  [ariaLabel]="t('loans.toolbar.columns')"
                />
              </ng-template>

              <ng-template #center>
                <p-iconfield>
                  <p-inputicon class="pi pi-search" />
                  <input
                    #search
                    pInputText
                    type="search"
                    [placeholder]="t('loans.toolbar.search')"
                    [attr.aria-label]="t('loans.toolbar.search')"
                    (input)="loanTable.filterGlobal(search.value, 'contains')"
                  />
                </p-iconfield>
              </ng-template>

              <ng-template #end>
                <p-button
                  type="button"
                  icon="pi pi-download"
                  severity="secondary"
                  [label]="t('loans.toolbar.exportCsv')"
                  (onClick)="loanTable.exportCSV()"
                />
              </ng-template>
            </p-toolbar>

            <!-- [totalRecords]: PrimeNG 22 RC only derives it from [value] on the first load, so the paginator kept the
                 unfiltered page count after a form search. An active global filter still overrides it with its own count. -->
            <p-table
              #loanTable
              dataKey="id"
              exportFilename="loans"
              columnResizeMode="expand"
              [value]="rows()"
              [totalRecords]="rows().length"
              [columns]="visibleColumns()"
              [globalFilterFields]="globalFilterFields"
              [resizableColumns]="true"
              [paginator]="true"
              [rows]="10"
              [(first)]="first"
              [rowHover]="true"
              [stripedRows]="true"
              [scrollable]="true"
              [tableStyle]="{ 'min-width': '60rem' }"
            >
              <ng-template #header>
                <tr>
                  @for (column of visibleColumns(); track column.key) {
                    <th pResizableColumn [pSortableColumn]="column.field" [class.text-right]="column.isNumeric">
                      {{ column.header }} <p-sort-icon [field]="column.field" />
                    </th>
                  }
                </tr>
              </ng-template>

              <ng-template #body let-loan>
                <tr>
                  @for (column of visibleColumns(); track column.key) {
                    <td [class.text-right]="column.isNumeric">
                      @switch (column.format) {
                        @case ('code') {
                          <span class="font-mono whitespace-nowrap">{{ loan[column.field] }}</span>
                        }
                        @case ('currency') {
                          {{ loan[column.field] | currency: 'EUR' }}
                        }
                        @case ('percent') {
                          {{ loan[column.field] | percent: '1.2-2' }}
                        }
                        @case ('date') {
                          {{ loan[column.field] | date: 'mediumDate' }}
                        }
                        @case ('status') {
                          <p-tag [value]="loan.statusLabel" [severity]="loan.statusSeverity" />
                        }
                        @default {
                          {{ loan[column.field] }}
                        }
                      }
                    </td>
                  }
                </tr>
              </ng-template>

              <ng-template #emptymessage>
                <tr>
                  <td [attr.colspan]="visibleColumns().length">{{ t('loans.empty') }}</td>
                </tr>
              </ng-template>
            </p-table>
          </div>
        </p-card>
      </ng-container>
    </main>
  `,
})
export class LoansPage {
  private readonly translations = translateObjectSignal('loans');
  private readonly loanTranslations = computed(() => this.translations() as LoanTranslations);

  protected readonly globalFilterFields = loanColumns.map((column) => column.field);

  protected readonly columnForm = form(signal({ visibleKeys: loanColumns.map((column) => column.key) }));

  protected readonly filter = signal(emptyLoanFilter);
  /** Index of the first row on the current page; reset on every search so a narrower result never lands on an empty page. */
  protected readonly first = signal(0);

  protected readonly rows = computed(() =>
    sampleLoans.filter((loan) => matchesLoanFilter(loan, this.filter())).map((loan) => toLoanRow(loan, this.loanTranslations())),
  );

  /** All columns with translated headers; `header` and `field` are what PrimeNG's CSV export reads. */
  protected readonly columnOptions = computed(() =>
    loanColumns.map((column) => ({ ...column, header: this.loanTranslations().columns[column.key] })),
  );

  /** The columns picked in the toggle, kept in their original order. */
  protected readonly visibleColumns = computed(() => {
    const visibleKeys = new Set<LoanColumnKey>(this.columnForm.visibleKeys().value());
    return this.columnOptions().filter((column) => visibleKeys.has(column.key));
  });

  protected onFilterChange(filter: LoanFilter): void {
    this.filter.set(filter);
    this.first.set(0);
  }
}
