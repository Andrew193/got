import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { NgClass } from '@angular/common';
import { EffectsHighlighterComponent } from '../../../common/effects-highlighter/effects-highlighter.component';
import { MatChip, MatChipSet } from '@angular/material/chips';
import { AssistantRecord } from '../../../../store/store.interfaces';
import { ASSISTANT_FACADE, ASSISTANT_MEMORY_TYPE } from '../../../../models/tokens';
import { AssistantResponseHolderBodyComponent } from '../../../../models/interfaces/assistant.interface';

@Component({
  selector: 'app-response-holder-body',
  imports: [NgClass, EffectsHighlighterComponent, MatChipSet, MatChip],
  templateUrl: './response-holder-body.component.html',
  styleUrl: './response-holder-body.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResponseHolderBodyComponent implements AssistantResponseHolderBodyComponent {
  facade = inject(ASSISTANT_FACADE);
  assistantMemoryType = inject(ASSISTANT_MEMORY_TYPE);

  memoryKeys = this.facade.assistantService.assistant.getMemoryKeys();

  constructor() {
    this.facade.assistantService.assistant.setMemoryType(this.assistantMemoryType);
  }

  selectedResponse = input(false);
  record = input.required<AssistantRecord>();
}
