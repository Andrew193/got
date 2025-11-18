import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { NgClass } from '@angular/common';
import { EffectsHighlighterComponent } from '../../../common/effects-highlighter/effects-highlighter.component';
import { MatChip, MatChipSet } from '@angular/material/chips';
import { AssistantRecord } from '../../../../store/store.interfaces';
import { ASSISTANT_FACADE, ASSISTANT_MEMORY_TYPE } from '../../../../models/tokens';
import { AssistantResponseHolderBodyComponent } from '../../../../models/interfaces/assistant.interface';
import { Keyword } from '../../../../models/taverna/taverna.model';

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
  chipClicked = output<string>();

  constructor() {
    this.facade.assistantService.assistant.setMemoryType(this.assistantMemoryType);
  }

  selectedKeywords = input<Keyword[]>([]);
  record = input.required<AssistantRecord>();

  selectedResponse = computed(() => this.selectedKeywords().length > 0);

  chipSelected(tag: string) {
    return !!this.selectedKeywords().find(_ => _.word === tag);
  }
}
