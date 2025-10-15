import { Component, inject } from '@angular/core';
import { GameEntryPointComponent } from '../../../../game-entry-point/game-entry-point.component';
import { TileUnit } from '../../../../../models/field.model';
import {
  SceneComponent,
  SceneContext,
} from '../../../../../models/interfaces/scenes/scene.interface';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { BASIC_CURRENCY, SceneNames } from '../../../../../constants';
import { HeroesService } from '../../../../../services/heroes/heroes.service';

@Component({
  selector: 'app-first-battle',
  imports: [GameEntryPointComponent],
  templateUrl: './first-battle.component.html',
  styleUrl: './first-battle.component.scss',
})
export class FirstBattleComponent implements SceneComponent {
  heroService = inject(HeroesService);
  repeat = false;

  aiUnits: TileUnit[] = [
    this.heroService.getTileUnit(this.heroService.getIceRiverHunter(), { user: false, x: 3, y: 3 }),
  ];
  userUnits: TileUnit[] = [];

  bottomSheetRef =
    inject<MatBottomSheetRef<FirstBattleComponent, SceneContext<SceneNames.firstBattle>>>(
      MatBottomSheetRef,
    );
  data = inject<SceneContext<SceneNames.firstHero>>(MAT_BOTTOM_SHEET_DATA);

  runScene(): void {
    this.userUnits = [
      this.heroService.getTileUnit(this.heroService.getUnitByName(this.data.name), {
        user: true,
        x: 0,
        y: 0,
      }),
    ];
  }

  battleEnd = (_: any, win: boolean) => {
    this.repeat = !win;
    this.stopScene();
  };

  stopScene() {
    this.bottomSheetRef.dismiss({
      reward: BASIC_CURRENCY,
      name: this.data.name,
      repeat: this.repeat,
      startWithScene: SceneNames.firstHero,
    });
  }
}
