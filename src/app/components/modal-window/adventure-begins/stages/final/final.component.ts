import { Component, inject } from '@angular/core';
import {
  SceneComponent,
  SceneContext,
} from '../../../../../models/interfaces/scenes/scene.interface';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { SceneNames } from '../../../../../constants';
import { DisplayRewardComponent } from '../../../../display-reward/display-reward.component';
import { DisplayReward } from '../../../../../services/reward/reward.service';
import { CurrencyHelperService } from '../../../../../services/users/currency/helper/currency-helper.service';

@Component({
  selector: 'app-login-final',
  templateUrl: './final.component.html',
  imports: [DisplayRewardComponent],
  styleUrl: './final.component.scss',
})
export class FinalComponent implements SceneComponent {
  showNextSceneButton = false;

  bottomSheetRef = inject(MatBottomSheetRef<FinalComponent, SceneContext<SceneNames>>);
  data = inject<SceneContext<SceneNames.firstBattle>>(MAT_BOTTOM_SHEET_DATA);
  currencyHelperService = inject(CurrencyHelperService);

  rewards: DisplayReward[] = [];

  runScene(): void {
    this.rewards = this.currencyHelperService.convertCurrencyToDisplayReward(this.data.reward);
  }

  stopScene(): void {
    this.bottomSheetRef.dismiss({ repeat: false });
  }

  showBtn(shouldOpen: boolean) {
    this.showNextSceneButton = shouldOpen;
  }
}
