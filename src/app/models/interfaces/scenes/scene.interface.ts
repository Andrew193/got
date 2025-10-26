import { Type } from '@angular/core';
import { SceneNames } from '../../../constants';
import { Currency } from '../../../services/users/users.interfaces';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { UnitName } from '../../units-related/unit.model';

export interface SceneComponent<Component = unknown, Context extends SceneNames = SceneNames> {
  runScene(): void;
  stopScene(): void;
  readonly bottomSheetRef: MatBottomSheetRef<Component, SceneContext<Context>>;
}

export interface ScenesRunnerHost {
  inProgress: boolean;
  playSequences(): void;
}

export type Scene = {
  component: Type<SceneComponent>;
  name: SceneNames;
  contextName?: SceneNames;
  nextScene?: Scene;
};

export type Scenario = {
  scenes: Scene[];
  resultParser?: (context: Map<SceneNames, SceneContext<SceneNames>>) => SceneContext<SceneNames>[];
};

export type SceneConfig = {
  repeat: boolean;
  startWithScene?: SceneNames;
};

export type SceneContext<T extends SceneNames> = {
  [SceneNames.welcome]: SceneConfig;
  [SceneNames.firstHero]: { name: UnitName } & SceneConfig;
  [SceneNames.firstBattle]: { reward: Currency } & SceneContext<SceneNames.firstHero> & SceneConfig;
  [SceneNames.finalAuth]: SceneConfig;
}[T];
