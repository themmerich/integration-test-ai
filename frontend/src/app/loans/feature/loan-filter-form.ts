import { Component, computed, output, signal } from '@angular/core';
import { FormField, form } from '@angular/forms/signals';
import { TranslocoDirective, translateObjectSignal } from '@jsverse/transloco';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';

import { LoanStatus, LoanType } from '../domain/loan';
import { LoanFilter, emptyLoanFilter } from '../domain/loan-filter';
import { LoanTranslations } from './loan-columns';

type LoanFilterFormModel = {
  borrower: string;
  types: LoanType[];
  statuses: LoanStatus[];
  minAmount: number | null;
  maxAmount: number | null;
  /** DatePicker range value: `[from, to]`, where `to` stays `null` until the second date is picked. */
  disbursementPeriod: (Date | null)[] | null;
};

const emptyModel: LoanFilterFormModel = {
  borrower: '',
  types: [],
  statuses: [],
  minAmount: null,
  maxAmount: null,
  disbursementPeriod: null,
};

@Component({
  selector: 'app-loan-filter-form',
  imports: [FormField, TranslocoDirective, ButtonModule, DatePickerModule, InputNumberModule, InputTextModule, MultiSelectModule],
  template: `
    <ng-container *transloco="let t">
      <form class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4" (submit)="onSearch($event)">
        <div class="flex flex-col gap-2">
          <label for="loan-filter-borrower" class="font-medium">{{ t('loans.filter.borrower') }}</label>
          <input pInputText id="loan-filter-borrower" [formField]="filterForm.borrower" class="w-full" />
        </div>

        <div class="flex flex-col gap-2">
          <label for="loan-filter-types" class="font-medium">{{ t('loans.filter.types') }}</label>
          <p-multiselect
            inputId="loan-filter-types"
            optionLabel="label"
            optionValue="value"
            [options]="typeOptions()"
            [formField]="filterForm.types"
            [placeholder]="t('loans.filter.any')"
            class="w-full"
          />
        </div>

        <div class="flex flex-col gap-2">
          <label for="loan-filter-statuses" class="font-medium">{{ t('loans.filter.statuses') }}</label>
          <p-multiselect
            inputId="loan-filter-statuses"
            optionLabel="label"
            optionValue="value"
            [options]="statusOptions()"
            [formField]="filterForm.statuses"
            [placeholder]="t('loans.filter.any')"
            class="w-full"
          />
        </div>

        <div class="flex flex-col gap-2">
          <label for="loan-filter-period" class="font-medium">{{ t('loans.filter.disbursementPeriod') }}</label>
          <!-- $any: PrimeNG 22 RC types DatePicker's inherited min/max inputs as number, which clashes with
               the Date-typed min/max that [formField] binds for a Date field. Runtime binding is unaffected. -->
          <p-datepicker
            inputId="loan-filter-period"
            selectionMode="range"
            [formField]="$any(filterForm.disbursementPeriod)"
            [showIcon]="true"
            [placeholder]="t('loans.filter.any')"
            class="w-full"
          />
        </div>

        <div class="flex flex-col gap-2">
          <label for="loan-filter-min-amount" class="font-medium">{{ t('loans.filter.minAmount') }}</label>
          <p-inputnumber
            inputId="loan-filter-min-amount"
            mode="currency"
            currency="EUR"
            [formField]="filterForm.minAmount"
            class="w-full"
          />
        </div>

        <div class="flex flex-col gap-2">
          <label for="loan-filter-max-amount" class="font-medium">{{ t('loans.filter.maxAmount') }}</label>
          <p-inputnumber
            inputId="loan-filter-max-amount"
            mode="currency"
            currency="EUR"
            [formField]="filterForm.maxAmount"
            class="w-full"
          />
        </div>

        <div class="flex items-end gap-2 md:col-span-2">
          <p-button type="submit" icon="pi pi-search" [label]="t('loans.filter.search')" />
          <p-button type="button" icon="pi pi-filter-slash" severity="secondary" [label]="t('loans.filter.reset')" (onClick)="onReset()" />
        </div>
      </form>
    </ng-container>
  `,
})
export class LoanFilterForm {
  private readonly translations = translateObjectSignal('loans');
  private readonly loanTranslations = computed(() => this.translations() as LoanTranslations);

  readonly filterChange = output<LoanFilter>();

  protected readonly typeOptions = computed(() => toOptions(this.loanTranslations().types));
  protected readonly statusOptions = computed(() => toOptions(this.loanTranslations().statuses));

  protected readonly model = signal<LoanFilterFormModel>(emptyModel);
  protected readonly filterForm = form(this.model);

  protected onSearch(event: Event): void {
    event.preventDefault();
    this.filterChange.emit(toLoanFilter(this.model()));
  }

  protected onReset(): void {
    this.model.set(emptyModel);
    this.filterChange.emit(emptyLoanFilter);
  }
}

function toOptions<T extends string>(labels: Record<T, string>): { value: T; label: string }[] {
  return (Object.keys(labels) as T[]).map((value) => ({ value, label: labels[value] }));
}

function toLoanFilter(model: LoanFilterFormModel): LoanFilter {
  const [from, to] = model.disbursementPeriod ?? [];
  // A range with only a start date filters that single day.
  const end = to ?? from;
  return {
    borrower: model.borrower,
    types: model.types,
    statuses: model.statuses,
    minAmount: model.minAmount,
    maxAmount: model.maxAmount,
    disbursedFrom: from ? toIsoDate(from) : null,
    disbursedTo: end ? toIsoDate(end) : null,
  };
}

/** Formats in local time; `toISOString()` would shift the day across time zones. */
function toIsoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}
