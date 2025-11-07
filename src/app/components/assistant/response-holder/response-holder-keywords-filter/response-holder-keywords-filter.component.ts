import { ChangeDetectionStrategy, Component, computed, inject, output } from '@angular/core';
import { selectAllKeywordsLabels } from '../../../../store/reducers/assistant.reducer';
import { Store } from '@ngrx/store';
import { BaseSelectComponent } from '../../../data-inputs/base-select/base-select.component';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { LabelValue } from '../../../form/enhancedFormConstructor/form-constructor.models';
import { distinctUntilChanged, filter, Observable, of } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AssistantFilterForm,
  AssistantResponseHolderKeywordsFilterComponent,
} from '../../../../models/interfaces/assistant.interface';

@Component({
  selector: 'app-response-holder-keywords-filter',
  imports: [BaseSelectComponent, ReactiveFormsModule],
  templateUrl: './response-holder-keywords-filter.component.html',
  styleUrl: './response-holder-keywords-filter.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResponseHolderKeywordsFilterComponent
  implements AssistantResponseHolderKeywordsFilterComponent
{
  store = inject(Store);
  filtersChange = output<string[]>();

  filtersForm = new FormGroup<AssistantFilterForm>({
    filter: new FormControl<string[]>([], { nonNullable: true }),
  });
  prevOptions: LabelValue[] = [];

  allKeywords = this.store.selectSignal(selectAllKeywordsLabels());
  filterOptions = computed((): Observable<LabelValue[]> => {
    const activeFilters = this.filtersForm.getRawValue().filter;
    const newOptions = this.allKeywords().map(keyword => ({ label: keyword, value: keyword }));

    const diff = newOptions
      .filter(option => {
        return !this.prevOptions.find(prevOption => prevOption.value === option.value);
      })
      .map(el => el.value);

    this.filtersForm.patchValue({
      filter: [...activeFilters, ...diff],
    });

    this.prevOptions = newOptions;

    return of(newOptions);
  });

  constructor() {
    this.filtersForm.valueChanges
      .pipe(takeUntilDestroyed(), distinctUntilChanged(), filter(Boolean))
      .subscribe(filters => {
        this.filtersChange.emit(filters.filter || []);
      });
  }
}
