import { computed, inject, Injectable, ModelSignal, signal } from '@angular/core';
import { Observable, EMPTY } from 'rxjs';
import { catchError, delay, finalize, switchMap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EquipmentUpgradeCost } from '../../models/units-related/unit.model';
import { Currency } from '../../services/users/users.interfaces';
import { UsersService } from '../../services/users/users.service';
import { CURRENCY_NAMES, SNACKBAR_CONFIG } from '../../constants';

@Injectable()
export class UpgradeService {
  private usersService = inject(UsersService);
  private snackBar = inject(MatSnackBar);

  private maxLevel = 0;

  currentLevel = signal<number>(0);
  private getCostFn = signal<(level: number) => EquipmentUpgradeCost | null>(() => null);
  currency = signal<Currency>({ gold: 0, silver: 0, copper: 0 });
  isLoading = signal(false);

  costInfo = computed<EquipmentUpgradeCost | null>(() => this.getCostFn()(this.currentLevel()));
  isMaxLevel = computed(() => this.currentLevel() >= this.maxLevel);
  canAfford = computed<boolean>(() => {
    const cost = this.costInfo();

    return cost ? this.currency()[cost.currency] >= cost.cost : false;
  });

  init(
    startingLevel: number,
    costCalculator: (level: number) => EquipmentUpgradeCost | null,
    currency: ModelSignal<Currency>,
    maxLevel: number,
  ) {
    this.currentLevel.set(startingLevel);
    this.getCostFn.set(costCalculator);
    this.currency = currency;
    this.maxLevel = maxLevel;
  }

  execute(upgradeRequest$: Observable<unknown>, onSuccess: () => void) {
    if (this.isMaxLevel() || this.isLoading()) return;

    if (!this.canAfford()) {
      this.snackBar.open(
        `Not enough ${this.costInfo()?.currency ?? 'currency'}!`,
        'OK',
        SNACKBAR_CONFIG,
      );

      return;
    }

    const costInfo = this.costInfo()!;

    this.isLoading.set(true);

    upgradeRequest$
      .pipe(
        switchMap(() =>
          this.usersService.updateCurrency({
            gold: costInfo.currency === CURRENCY_NAMES.gold ? -costInfo.cost : 0,
            silver: costInfo.currency === CURRENCY_NAMES.silver ? -costInfo.cost : 0,
            copper: costInfo.currency === CURRENCY_NAMES.copper ? -costInfo.cost : 0,
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
        onSuccess();
      });
  }
}
