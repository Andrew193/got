import { Component, inject } from '@angular/core';
import { GameEntryPointComponent } from '../../../components/game-entry-point/game-entry-point.component';
import { HeroesFacadeService } from '../../../services/facades/heroes/heroes.service';
import { NavigationService } from '../../../services/facades/navigation/navigation.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Coordinate, GameResultsRedirectType, TileUnit } from '../../../models/field.model';
import { HeroesNamesCodes, UnitConfig, UnitName } from '../../../models/units-related/unit.model';
import { AI_POSITIONS, USER_POSITIONS } from '../../campaign/campaign.constants';
import { SNACKBAR_CONFIG } from '../../../constants';
import { BanquetHallFacadeService } from '../services/banquet-hall-facade.service';

export type BanquetBattleState = {
  isBanquet: true;
  battleId: string;
  userId: string;
  heroName: HeroesNamesCodes;
  isBoss: boolean;
  isPostUnlockMode: boolean;
  userUnitNames: UnitName[];
  aiUnitNames: HeroesNamesCodes[];
  aiUnitConfig: UnitConfig;
};

@Component({
  selector: 'app-banquet-battlefield',
  standalone: true,
  imports: [GameEntryPointComponent],
  templateUrl: './banquet-battlefield.component.html',
  styleUrl: './banquet-battlefield.component.scss',
})
export class BanquetBattlefieldComponent {
  private heroesService = inject(HeroesFacadeService);
  private nav = inject(NavigationService);
  private snackBar = inject(MatSnackBar);
  private banquetFacade = inject(BanquetHallFacadeService);

  userUnits: TileUnit[] = [];
  aiUnits: TileUnit[] = [];

  constructor() {
    const state = history.state as BanquetBattleState | null;

    if (!state?.isBanquet || !state.userUnitNames?.length || !state.aiUnitNames?.length) {
      this.nav.goToBanquetHall();

      return;
    }

    const buildTileUnit = (
      name: UnitName,
      team: UnitName[],
      pos: Coordinate,
      isUser = true,
      config?: UnitConfig,
    ) =>
      this.heroesService.getTileUnit(this.heroesService.getUnitByName(name, config), team, {
        user: isUser,
        x: pos.x,
        y: pos.y,
      });

    this.userUnits = state.userUnitNames.map((name, index) =>
      buildTileUnit(name, state.userUnitNames, USER_POSITIONS[index] ?? { x: index, y: 1 }),
    );
    this.aiUnits = state.aiUnitNames.map((name, index) =>
      buildTileUnit(
        name,
        state.aiUnitNames,
        AI_POSITIONS[index] ?? { x: index % 5, y: 8 },
        false,
        state.aiUnitConfig,
      ),
    );
  }

  gameResultsRedirect: GameResultsRedirectType = (_, win) => {
    const state = history.state as BanquetBattleState;

    if (!state?.isBanquet) {
      this.nav.goToBanquetHall();

      return;
    }

    this.banquetFacade.onBattleEnd(win, state).subscribe({
      next: () => this.nav.goToBanquetHall(),
      error: (err: { error?: string }) => {
        this.snackBar.open(
          'Failed to add shards: ' + (err?.error ?? 'Unknown error'),
          'Ok',
          SNACKBAR_CONFIG,
        );
        this.nav.goToBanquetHall();
      },
    });
  };
}
