import { SceneNames } from '../../../constants';
import {
  Scenario,
  Scene,
  SceneComponent,
  SceneContext,
} from '../../../models/interfaces/scenes/scene.interface';
import {
  catchError,
  concatMap,
  from,
  Observable,
  of,
  switchMap,
  tap,
  throwError,
  toArray,
} from 'rxjs';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { inject, Injectable } from '@angular/core';

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
      catchError(err => {
        if (err instanceof RestartError) {
          const startIdx = Math.max(
            0,
            scenes.findIndex(s => s.name === err.startFrom),
          );
          const next = startIdx >= 0 ? scenes.slice(startIdx) : scenes;

          return this.playSequence(next);
        }

        return throwError(() => err);
      }),
    );
  }

  private runOnce(scenes: Scene[]): Observable<SceneContext<SceneNames>[]> {
    return from(scenes).pipe(
      concatMap(scene =>
        this.openOne(scene).pipe(
          switchMap(result => {
            if (result?.repeat) {
              const startFrom = result.startWithScene ?? scene.name ?? scenes[0].name;

              return throwError(() => new RestartError(startFrom));
            }

            return of(result);
          }),
        ),
      ),
      toArray(),
    );
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

    return ref
      .afterDismissed()
      .pipe(tap(result => this.context.set(scene.name, result))) as Observable<
      SceneContext<SceneNames>
    >;
  }
}

class RestartError extends Error {
  constructor(public startFrom: SceneNames) {
    super('RESTART_SCENES');
  }
}
