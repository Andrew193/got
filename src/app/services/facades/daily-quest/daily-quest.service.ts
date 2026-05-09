import { inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { firstValueFrom } from 'rxjs';

import { QuestId } from '../../../../../server/types';
import { DailyQuestActions } from '../../../store/actions/daily-quest.actions';
import {
  selectDailyQuests,
  selectDailyQuestsError,
  selectDailyQuestsLoading,
  selectHasReadyToClaim,
  selectQuestById,
} from '../../../store/selectors/daily-quest.selectors';

@Injectable({ providedIn: 'root' })
export class DailyQuestService {
  private store = inject(Store);

  readonly quests$ = this.store.select(selectDailyQuests);
  readonly loading$ = this.store.select(selectDailyQuestsLoading);
  readonly error$ = this.store.select(selectDailyQuestsError);
  readonly hasReadyToClaim$ = this.store.select(selectHasReadyToClaim);

  loadQuests() {
    this.store.dispatch(DailyQuestActions.loadQuests());
  }

  async markQuestAsCompleted(questId: QuestId) {
    const quest = await firstValueFrom(this.store.select(selectQuestById(questId)));

    if (quest?.status !== 'pending') {
      return;
    }

    this.store.dispatch(DailyQuestActions.markQuestAsCompleted({ questId }));
  }

  async claimQuestReward(questId: QuestId) {
    const quest = await firstValueFrom(this.store.select(selectQuestById(questId)));

    if (quest?.status !== 'ready_to_claim') {
      return;
    }

    this.store.dispatch(DailyQuestActions.claimQuestReward({ questId }));
  }
}
