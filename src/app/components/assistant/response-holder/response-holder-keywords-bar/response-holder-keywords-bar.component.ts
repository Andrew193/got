import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectAllKeywords } from '../../../../store/reducers/assistant.reducer';
import { AsyncPipe } from '@angular/common';
import { MatChipListbox, MatChipOption } from '@angular/material/chips';
import { AssistantActions } from '../../../../store/actions/assistant.actions';
import { AssistantResponseHolderKeywordsBarComponent } from '../../../../models/interfaces/assistant.interface';
import { ASSISTANT_MEMORY_TYPE } from '../../../../models/tokens';
import { Keyword } from '../../../../models/taverna/taverna.model';

@Component({
  selector: 'app-response-holder-keywords-bar',
  templateUrl: './response-holder-keywords-bar.component.html',
  imports: [AsyncPipe, MatChipListbox, MatChipOption],
  styleUrl: './response-holder-keywords-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResponseHolderKeywordsBarComponent
  implements AssistantResponseHolderKeywordsBarComponent
{
  store = inject(Store);
  assistantMemoryType = inject(ASSISTANT_MEMORY_TYPE);
  allKeywords = this.store.select(selectAllKeywords);

  optionChange(keyword: Keyword) {
    this.store.dispatch(
      AssistantActions.updateKeyword({
        data: {
          word: keyword.word,
          active: !keyword.active,
          assistantMemoryType: this.assistantMemoryType,
        },
      }),
    );
  }
}
