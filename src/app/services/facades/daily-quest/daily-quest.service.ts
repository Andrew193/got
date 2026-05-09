import { inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { firstValueFrom } from 'rxjs';

import { QuestId } from '../../../../../server/types';
import { DailyQuestActions } from '../../../store/actions/daily-quest.actions';
import {
  selectDailyQuests,
  selectDailyQuestsError,
  selectDailyQuestsLoading,
  selectQuestById,
} from '../../../store/selectors/daily-quest.selectors';

@Injectable({ providedIn: 'root' })
export class DailyQuestService {
  private store = inject(Store);

  readonly quests$ = this.store.select(selectDailyQuests);
  readonly loading$ = this.store.select(selectDailyQuestsLoading);
  readonly error$ = this.store.select(selectDailyQuestsError);

  loadQuests() {
    this.store.dispatch(DailyQuestActions.loadQuests());
  }

  async completeQuest(questId: QuestId) {
    const quest = await firstValueFrom(this.store.select(selectQuestById(questId)));

    if (quest?.completed) {
      return;
    }

    this.store.dispatch(DailyQuestActions.completeQuest({ questId }));
  }
}
