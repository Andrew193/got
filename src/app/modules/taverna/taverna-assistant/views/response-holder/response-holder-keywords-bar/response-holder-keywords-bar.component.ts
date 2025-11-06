import { Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectAllKeywords } from '../../../../../../store/reducers/assistant.reducer';
import { AsyncPipe } from '@angular/common';
import { MatChipListbox, MatChipOption, MatChipSelectionChange } from '@angular/material/chips';
import { AssistantActions } from '../../../../../../store/actions/assistant.actions';

@Component({
  selector: 'app-response-holder-keywords-bar',
  templateUrl: './response-holder-keywords-bar.component.html',
  imports: [AsyncPipe, MatChipListbox, MatChipOption],
  styleUrl: './response-holder-keywords-bar.component.scss',
})
export class ResponseHolderKeywordsBarComponent {
  store = inject(Store);
  allKeywords = this.store.select(selectAllKeywords);

  optionChange(event: MatChipSelectionChange) {
    this.store.dispatch(
      AssistantActions.updateKeyword({
        data: {
          word: event.source.value,
          active: event.selected,
        },
      }),
    );
  }
}
