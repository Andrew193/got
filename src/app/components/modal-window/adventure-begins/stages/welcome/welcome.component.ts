import { Component, inject } from '@angular/core';
import {
  SceneComponent,
  SceneContext,
} from '../../../../../models/interfaces/scenes/scene.interface';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatTab, MatTabChangeEvent, MatTabGroup } from '@angular/material/tabs';
import { SceneNames } from '../../../../../constants';

@Component({
  selector: 'app-welcome',
  imports: [MatTabGroup, MatTab],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.scss',
})
export class WelcomeComponent implements SceneComponent {
  bottomSheetRef =
    inject<MatBottomSheetRef<WelcomeComponent, SceneContext<SceneNames.welcome>>>(
      MatBottomSheetRef,
    );

  showNextSceneButton = false;

  runScene() {}

  stopScene() {
    this.bottomSheetRef.dismiss({ repeat: false });
  }

  onTabChange(event: MatTabChangeEvent) {
    this.showNextSceneButton = event.index == 2;
  }
}
