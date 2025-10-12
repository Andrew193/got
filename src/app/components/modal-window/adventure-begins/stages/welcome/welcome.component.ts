import { Component, inject } from '@angular/core';
import { SceneComponent } from '../../../../../models/interfaces/scenes/scene.interface';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatTab, MatTabChangeEvent, MatTabGroup } from '@angular/material/tabs';

@Component({
  selector: 'app-welcome',
  imports: [MatTabGroup, MatTab],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.scss',
})
export class WelcomeComponent implements SceneComponent {
  private _bottomSheetRef = inject<MatBottomSheetRef<WelcomeComponent>>(MatBottomSheetRef);

  showNextSceneButton = false;

  runScene() {
    console.log('start');
  }

  stopScene() {
    this._bottomSheetRef.dismiss();
    console.log('stop');
  }

  onTabChange(event: MatTabChangeEvent) {
    this.showNextSceneButton = event.index == 2;
  }
}
