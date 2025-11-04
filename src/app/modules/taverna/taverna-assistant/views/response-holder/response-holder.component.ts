import { Component, computed, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  selectAssistantRecords,
  selectRecordsLoading,
} from '../../../../../store/reducers/assistant.reducer';
import { TavernaFacadeService } from '../../../../../services/facades/taverna/taverna.service';
import { AsyncPipe, NgClass } from '@angular/common';
import { MatChip, MatChipSet } from '@angular/material/chips';
import { EffectsHighlighterComponent } from '../../../../../components/common/effects-highlighter/effects-highlighter.component';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { ContainerLabelComponent } from '../../../../../components/views/container-label/container-label.component';

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
  ],
  templateUrl: './response-holder.component.html',
  styleUrl: './response-holder.component.scss',
})
export class ResponseHolderComponent {
  store = inject(Store);
  facade = inject(TavernaFacadeService);
  memory = this.facade.assistantService.assistant.getMemory();

  isLoading = this.store.select(selectRecordsLoading());
  records = this.store.selectSignal(selectAssistantRecords);

  parsedRecords = computed(() => {
    return this.facade.assistantService.parseRecords(this.records(), Object.keys(this.memory));
  });
}
