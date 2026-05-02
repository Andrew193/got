import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as fc from 'fast-check';
import { vi } from 'vitest';

import { EquipmentCardComponent } from './equipment-card.component';
import { UpgradeService } from '../../../../services/upgrade/upgrade.service';
import { HeroProgressService } from '../../../../services/facades/hero-progress/hero-progress.service';
import { UsersService } from '../../../../services/users/users.service';
import {
  EqName,
  GearPart,
  HeroesNamesCodes,
  Unit,
} from '../../../../models/units-related/unit.model';
import { Currency } from '../../../../services/users/users.interfaces';

const PBT_RUNS = 100;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeSnackBarSpy() {
  return { open: vi.fn() };
}

function makeHeroProgressServiceMock() {
  return {
    getEquipmentUpgradeCost: vi.fn().mockReturnValue({ cost: 100, currency: 'copper' }),
    upgradeEquipment: vi.fn().mockReturnValue({ subscribe: vi.fn() }),
  };
}

function makeUsersServiceMock() {
  return { updateCurrency: vi.fn() };
}

function makeMockHero(eq1Level = 1): Partial<Unit> {
  return {
    eq1Level,
    eq2Level: 1,
    eq3Level: 1,
    eq4Level: 1,
    level: 1,
  };
}

const mockGearParts: GearPart[] = [
  { alias: 'attackIncrement', src: 'attack_icon', color: 'attack-color' },
];

function createComponent(snackBarSpy = makeSnackBarSpy()) {
  const heroProgressMock = makeHeroProgressServiceMock();
  const usersServiceMock = makeUsersServiceMock();

  TestBed.configureTestingModule({
    imports: [EquipmentCardComponent],
    providers: [
      { provide: HeroProgressService, useValue: heroProgressMock },
      { provide: UsersService, useValue: usersServiceMock },
      { provide: MatSnackBar, useValue: snackBarSpy },
    ],
  });

  const fixture = TestBed.createComponent(EquipmentCardComponent);
  const component = fixture.componentInstance;

  // Set required inputs
  component.eqName = 'eq1' as EqName;
  component.hero = makeMockHero() as Unit;
  component.currency = { gold: 1000, silver: 1000, copper: 1000 } as Currency;
  component.heroName = HeroesNamesCodes.WhiteWolf;
  component.userId = 'test-user-id';
  component.getGearDescription = (name: EqName) => name;
  component.gearParts = mockGearParts;
  component.getIncrement = () => 10;

  fixture.detectChanges();

  // Get the UpgradeService instance from the component's injector
  const upgradeService = fixture.debugElement.injector.get(UpgradeService);

  return { fixture, component, upgradeService, snackBarSpy, heroProgressMock };
}

// ---------------------------------------------------------------------------
// Example tests — onUpgrade() guard logic
// ---------------------------------------------------------------------------

describe('EquipmentCardComponent — onUpgrade() guard logic', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('onUpgrade() при isMaxLevel = true → upgradeService.execute НЕ вызван', () => {
    const { component, upgradeService } = createComponent();
    const executeSpy = vi.spyOn(upgradeService, 'execute');

    // Set level to max (>= 200)
    upgradeService.currentLevel.set(200);

    component.onUpgrade();

    expect(executeSpy).not.toHaveBeenCalled();
  });

  it('onUpgrade() при upgradeService.isLoading() = true → upgradeService.execute НЕ вызван', () => {
    const { component, upgradeService } = createComponent();
    const executeSpy = vi.spyOn(upgradeService, 'execute');

    upgradeService.isLoading.set(true);

    component.onUpgrade();

    expect(executeSpy).not.toHaveBeenCalled();
  });

  it('onUpgrade() при canAfford() = false → snackbar "Not enough ..." открыт, execute НЕ вызван', () => {
    const snackBarSpy = makeSnackBarSpy();
    const { component, upgradeService } = createComponent(snackBarSpy);
    const executeSpy = vi.spyOn(upgradeService, 'execute');

    // Set currency to 0 so canAfford() returns false
    upgradeService.currency.set({ gold: 0, silver: 0, copper: 0 });
    // Ensure level is not max
    upgradeService.currentLevel.set(1);

    component.onUpgrade();

    expect(snackBarSpy.open).toHaveBeenCalledWith(
      expect.stringContaining('Not enough'),
      expect.any(String),
      expect.anything(),
    );
    expect(executeSpy).not.toHaveBeenCalled();
  });

  it('onUpgrade() при всех условиях выполнены → upgradeService.execute вызван', () => {
    const { component, upgradeService, heroProgressMock } = createComponent();
    const executeSpy = vi.spyOn(upgradeService, 'execute').mockImplementation(() => {});

    // Ensure not max level
    upgradeService.currentLevel.set(1);
    // Ensure not loading
    upgradeService.isLoading.set(false);
    // Ensure can afford: set currency high enough
    upgradeService.currency.set({ gold: 10000, silver: 10000, copper: 10000 });
    // Ensure getCostFn returns a valid cost
    upgradeService.getCostFn.set(() => ({ cost: 100, currency: 'copper' as const }));

    component.onUpgrade();

    expect(executeSpy).toHaveBeenCalledTimes(1);
  });
});

// ---------------------------------------------------------------------------
// Property-based tests
// ---------------------------------------------------------------------------

describe('EquipmentCardComponent — property-based tests', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
  });

  // Feature: upgrade-service, Property 8: isMaxLevel threshold
  // Validates: Requirements 4.5
  it('Property 8: isMaxLevel === (level >= 200) для любого уровня в диапазоне 0–300', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 300 }), level => {
        const { component, upgradeService } = createComponent();

        upgradeService.currentLevel.set(level);

        const result = component.isMaxLevel;
        const expected = level >= 200;

        TestBed.resetTestingModule();

        expect(result).toBe(expected);
      }),
      { numRuns: PBT_RUNS },
    );
  });
});
