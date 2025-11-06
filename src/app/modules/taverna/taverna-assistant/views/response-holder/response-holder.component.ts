import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  selectAllKeywords,
  selectAssistantRecords,
  selectRecordsLoading,
} from '../../../../../store/reducers/assistant.reducer';
import { TavernaFacadeService } from '../../../../../services/facades/taverna/taverna.service';
import { AsyncPipe, NgClass } from '@angular/common';
import { MatChip, MatChipSet } from '@angular/material/chips';
import { EffectsHighlighterComponent } from '../../../../../components/common/effects-highlighter/effects-highlighter.component';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { ContainerLabelComponent } from '../../../../../components/views/container-label/container-label.component';
import { ResponseHolderKeywordsBarComponent } from './response-holder-keywords-bar/response-holder-keywords-bar.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-response-holder',
  imports: [
    NgClass,
    MatChipSet,
    MatChip,
    EffectsHighlighterComponent,
    MatProgressSpinner,
    ContainerLabelComponent,
    AsyncPipe,
    ResponseHolderKeywordsBarComponent,
    MatSidenavModule,
    MatButtonModule,
  ],
  templateUrl: './response-holder.component.html',
  styleUrl: './response-holder.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResponseHolderComponent {
  store = inject(Store);
  facade = inject(TavernaFacadeService);
  memoryKeys = this.facade.assistantService.assistant.getMemoryKeys();

  allKeywords = this.store.selectSignal(selectAllKeywords);
  records = this.store.selectSignal(selectAssistantRecords);

  isLoading = this.store.select(selectRecordsLoading());

  containsSelectedTags(responseKeywords: string[]) {
    const activeKeywords = this.allKeywords().filter(keyword => keyword.active);

    return activeKeywords.some(activeKeyword => responseKeywords.includes(activeKeyword.word));
  }
}
