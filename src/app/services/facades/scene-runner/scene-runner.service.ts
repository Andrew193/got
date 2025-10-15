import { inject, Injectable } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { concatMap, from, Observable, of, switchMap, tap, toArray } from 'rxjs';
import {
  Scenario,
  Scene,
  SceneComponent,
  SceneContext,
} from '../../../models/interfaces/scenes/scene.interface';
import { SceneNames } from '../../../constants';

@Injectable({ providedIn: 'root' })
export class SceneRunnerService {
  context = new Map<SceneNames, SceneContext<SceneNames>>();
  scenario!: Scenario;

  private bottomSheet = inject(MatBottomSheet);

  init(scenario: Scenario) {
    this.scenario = scenario;

    return this.playSequence(this.scenario.scenes);
  }

  private playSequence(scenes: Scene[]): Observable<SceneContext<SceneNames>[] | undefined> {
    return this.runOnce(scenes).pipe(
      switchMap(results => {
        const restartCtx = results.find(r => r?.repeat);

        if (!restartCtx) {
          return of(this.getResultContext());
        }

        const startFrom =
          restartCtx.startWithScene ?? results.at(-1)!.startWithScene ?? scenes[0].name;
        const startIdx = scenes.findIndex(s => s.name === startFrom);
        const next = startIdx >= 0 ? scenes.slice(startIdx) : scenes;

        return this.playSequence(next);
      }),
    );
  }

  private runOnce(scenes: Scene[]): Observable<SceneContext<SceneNames>[]> {
    return from(scenes).pipe(
      concatMap(scene => this.openOne(scene)),
      toArray(),
    );
  }

  private getResultContext() {
    return Array.from(this.context).map(el => el[1]);
  }

  private openOne(scene: Scene) {
    const ref = this.bottomSheet.open(scene.component, {
      hasBackdrop: false,
      disableClose: true,
      data: scene.contextName && this.context.get(scene.contextName),
    });

    const sub = ref.afterOpened().subscribe(() => {
      (ref.instance as SceneComponent).runScene();
      sub.unsubscribe();
    });

    return ref.afterDismissed().pipe(
      tap({
        next: result => this.context.set(scene.name, result),
      }),
    ) as Observable<SceneContext<SceneNames>>;
  }
}
