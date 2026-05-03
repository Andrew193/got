import { inject, Injectable } from '@angular/core';
import { TileUnit } from '../../models/field.model';
import { Rarity } from '../../models/units-related/unit.model';
import { HeroesFacadeService } from '../facades/heroes/heroes.service';
import { RARITY_XP_MULTIPLIERS } from '../../constants/player-level.constants';
import { frontRoutes } from '../../constants';

@Injectable({
  providedIn: 'root',
})
export class XpCalculatorService {
  private heroService = inject(HeroesFacadeService);

  /**
   * Calculates XP earned from a battle.
   *
   * Returns 0 if:
   * - The player lost (win === false)
   * - The battle mode is Training
   *
   * Otherwise: XP = Σ floor((unit.maxHealth - unit.health) × rarityMultiplier)
   * for each enemy TileUnit, using post-battle HP values.
   */
  calculate(units: TileUnit[], win: boolean, mode: string): number {
    if (!win || mode === frontRoutes.training) {
      return 0;
    }

    let total = 0;

    for (const unit of units) {
      const rarity = this.heroService.getParamFromUnitByName(unit.name, 'rarity') as Rarity;
      const multiplier = RARITY_XP_MULTIPLIERS[rarity] ?? RARITY_XP_MULTIPLIERS[Rarity.COMMON];
      const finalDamage = unit.maxHealth - unit.health;

      total += Math.floor(finalDamage * multiplier);
    }

    return total;
  }
}
