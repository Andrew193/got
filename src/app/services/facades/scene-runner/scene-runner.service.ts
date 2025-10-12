import { inject, Injectable } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { concatMap, from } from 'rxjs';
import { Scene, SceneComponent } from '../../../models/interfaces/scenes/scene.interface';

@Injectable({
  providedIn: 'root',
})
export class SceneRunnerService {
  private bottomSheet = inject(MatBottomSheet);

  playSequence(scenes: Scene[]) {
    return from(scenes).pipe(concatMap(scene => this.openOne(scene)));
  }

  private openOne(scene: Scene) {
    const ref = this.bottomSheet.open(scene.component, {
      hasBackdrop: false,
      disableClose: true,
    });

    const sub = ref.afterOpened().subscribe(() => {
      (ref.instance satisfies SceneComponent).runScene();
      sub.unsubscribe();
    });

    return ref.afterDismissed();
  }
}
