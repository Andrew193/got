import { Type } from '@angular/core';

export interface SceneComponent {
  runScene(): void;
  stopScene(): void;
}

export interface ScenesRunnerHost {
  inProgress: boolean;
  playSequences(): void;
}

export type Scene = {
  component: Type<SceneComponent>;
  nextScene?: Scene;
};
