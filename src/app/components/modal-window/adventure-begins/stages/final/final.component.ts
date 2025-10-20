import { Component, inject } from '@angular/core';
import {
  SceneComponent,
  SceneContext,
} from '../../../../../models/interfaces/scenes/scene.interface';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { SceneNames } from '../../../../../constants';
import { DisplayRewardComponent } from '../../../../display-reward/display-reward.component';
import { CurrencyHelperService } from '../../../../../services/users/currency/helper/currency-helper.service';
import { Store } from '@ngrx/store';
import { DisplayRewardNames } from '../../../../../store/store.interfaces';
import { DisplayRewardActions } from '../../../../../store/actions/display-reward.actions';

@Component({
  selector: 'app-login-final',
  templateUrl: './final.component.html',
  imports: [DisplayRewardComponent],
  styleUrl: './final.component.scss',
})
export class FinalComponent implements SceneComponent {
  showNextSceneButton = false;
  store = inject(Store);
  contextName = DisplayRewardNames.finalLoginButtle;

  bottomSheetRef = inject(MatBottomSheetRef<FinalComponent, SceneContext<SceneNames>>);
  data = inject<SceneContext<SceneNames.firstBattle>>(MAT_BOTTOM_SHEET_DATA);
  currencyHelperService = inject(CurrencyHelperService);

  runScene(): void {
    const rewards = this.currencyHelperService.convertCurrencyToDisplayReward(this.data.reward);

    this.store.dispatch(
      DisplayRewardActions.setDisplayRewardState({ name: this.contextName, data: rewards }),
    );
  }

  stopScene(): void {
    this.bottomSheetRef.dismiss({ repeat: false });
  }

  showBtn(shouldOpen: boolean) {
    this.showNextSceneButton = shouldOpen;
  }
}
