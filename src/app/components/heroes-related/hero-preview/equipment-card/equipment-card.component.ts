import { Component, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EMPTY } from 'rxjs';
import { catchError, delay, finalize, switchMap } from 'rxjs/operators';
import {
  EqName,
  EQ_FIELD_MAP,
  EquipmentUpgradeCost,
  GearPart,
  HeroesNamesCodes,
  Unit,
} from '../../../../models/units-related/unit.model';
import { Currency } from '../../../../services/users/users.interfaces';
import { HeroProgressService } from '../../../../services/facades/hero-progress/hero-progress.service';
import { UsersService } from '../../../../services/users/users.service';
import { MatIcon } from '@angular/material/icon';
import { SNACKBAR_CONFIG } from '../../../../constants';

@Component({
  selector: 'app-equipment-card',
  standalone: true,
  imports: [NgClass, MatButtonModule, MatTooltipModule, MatIcon],
  templateUrl: './equipment-card.component.html',
  styleUrl: './equipment-card.component.scss',
})
export class EquipmentCardComponent {
  private heroProgressService = inject(HeroProgressService);
  private usersService = inject(UsersService);
  private snackBar = inject(MatSnackBar);

  @Input({ required: true }) eqName!: EqName;
  @Input({ required: true }) hero!: Unit;
  @Input({ required: true }) currency!: Currency;
  @Input({ required: true }) heroName!: HeroesNamesCodes;
  @Input({ required: true }) userId!: string;
  @Input({ required: true }) getGearDescription!: (name: EqName) => string;
  @Input({ required: true }) gearParts!: GearPart[];
  @Input({ required: true }) getIncrement!: (
    type: 'attackIncrement' | 'defenceIncrement' | 'healthIncrement',
  ) => number;

  @Output() upgraded = new EventEmitter<void>();

  isLoading = signal(false);

  get currentLevel(): number {
    return this.hero[EQ_FIELD_MAP[this.eqName]];
  }

  get isMaxLevel(): boolean {
    return this.currentLevel >= 200;
  }

  get costInfo(): EquipmentUpgradeCost | null {
    if (this.isMaxLevel) return null;

    return this.heroProgressService.getEquipmentUpgradeCost(this.currentLevel);
  }

  get canAfford(): boolean {
    if (!this.costInfo) return false;

    return this.currency[this.costInfo.currency] >= this.costInfo.cost;
  }

  onUpgrade() {
    if (this.isMaxLevel || this.isLoading()) return;

    if (!this.canAfford) {
      this.snackBar.open(
        `Not enough ${this.costInfo?.currency ?? 'currency'}!`,
        'OK',
        SNACKBAR_CONFIG,
      );

      return;
    }

    const costInfo = this.costInfo!;
    const eqField = EQ_FIELD_MAP[this.eqName];

    this.isLoading.set(true);

    this.heroProgressService
      .upgradeEquipment(this.userId, this.heroName, eqField, this.currentLevel)
      .pipe(
        switchMap(() =>
          this.usersService.updateCurrency({
            gold: costInfo.currency === 'gold' ? -costInfo.cost : 0,
            silver: costInfo.currency === 'silver' ? -costInfo.cost : 0,
            copper: costInfo.currency === 'copper' ? -costInfo.cost : 0,
          }),
        ),
        catchError(() => {
          this.snackBar.open('Upgrade failed!', 'Close', SNACKBAR_CONFIG);

          return EMPTY;
        }),
        delay(1000),
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe(() => {
        this.snackBar.open('Upgraded!', 'Great!', SNACKBAR_CONFIG);
        this.upgraded.emit();
      });
  }
}
