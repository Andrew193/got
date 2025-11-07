import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  selectAllKeywords,
  selectAssistantRecords,
  selectRecordsLoading,
} from '../../../store/reducers/assistant.reducer';
import { AsyncPipe } from '@angular/common';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { ContainerLabelComponent } from '../../views/container-label/container-label.component';
import { ResponseHolderKeywordsBarComponent } from './response-holder-keywords-bar/response-holder-keywords-bar.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { ResponseHolderKeywordsFilterComponent } from './response-holder-keywords-filter/response-holder-keywords-filter.component';
import { ResponseHolderBodyComponent } from './response-holder-body/response-holder-body.component';
import { AssistantResponseHolderComponent } from '../../../models/interfaces/assistant.interface';

@Component({
  selector: 'app-response-holder',
  imports: [
    MatProgressSpinner,
    ContainerLabelComponent,
    AsyncPipe,
    ResponseHolderKeywordsBarComponent,
    MatSidenavModule,
    MatButtonModule,
    MatIcon,
    ResponseHolderKeywordsFilterComponent,
    ResponseHolderBodyComponent,
  ],
  templateUrl: './response-holder.component.html',
  styleUrl: './response-holder.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResponseHolderComponent implements AssistantResponseHolderComponent {
  store = inject(Store);
  activeKeywords = signal<string[]>([]);

  isLoading = this.store.select(selectRecordsLoading());
  allKeywords = this.store.selectSignal(selectAllKeywords);
  records = this.store.selectSignal(selectAssistantRecords);
  filteredRecords = computed(() =>
    this.records().filter(record => {
      return record.request ? true : this.shouldShowResponseBasedOnActiveFilters(record.keywords);
    }),
  );

  shouldHighlightSelectedTags(responseKeywords: string[]) {
    const activeKeywords = this.allKeywords().filter(keyword => keyword.active);

    return activeKeywords.some(activeKeyword => responseKeywords.includes(activeKeyword.word));
  }

  shouldShowResponseBasedOnActiveFilters(responseKeywords: string[]) {
    return this.activeKeywords().some(el => responseKeywords.includes(el));
  }

  filtersChange(activeKeywords: string[]) {
    this.activeKeywords.set(activeKeywords);
  }
}
