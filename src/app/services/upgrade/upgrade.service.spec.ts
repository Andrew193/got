import { TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import * as fc from 'fast-check';
import { vi } from 'vitest';
import { MatSnackBar } from '@angular/material/snack-bar';

import { UpgradeService } from './upgrade.service';
import { UsersService } from '../users/users.service';
import { CURRENCY_NAMES } from '../../constants';
import { EquipmentUpgradeCost } from '../../models/units-related/unit.model';
import { Currency } from '../users/users.interfaces';

const PBT_RUNS = 100;

const currencyNames = [CURRENCY_NAMES.gold, CURRENCY_NAMES.silver, CURRENCY_NAMES.copper] as const;

type CurrencyName = (typeof currencyNames)[number];

function makeUpdateCurrencySpy() {
  return vi.fn().mockReturnValue(of({}));
}

function makeSnackBarSpy() {
  return { open: vi.fn() };
}

function setupTestBed(
  updateCurrencySpy = makeUpdateCurrencySpy(),
  snackBarSpy = makeSnackBarSpy(),
) {
  TestBed.configureTestingModule({
    providers: [
      UpgradeService,
      { provide: UsersService, useValue: { updateCurrency: updateCurrencySpy } },
      { provide: MatSnackBar, useValue: snackBarSpy },
    ],
  });

  return {
    service: TestBed.inject(UpgradeService),
    updateCurrencySpy,
    snackBarSpy,
  };
}

// ---------------------------------------------------------------------------
// Smoke tests
// ---------------------------------------------------------------------------

describe('UpgradeService — smoke tests', () => {
  let service: UpgradeService;

  beforeEach(() => {
    ({ service } = setupTestBed());
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('currentLevel() should equal 0 initially', () => {
    expect(service.currentLevel()).toBe(0);
  });

  it('isLoading() should equal false initially', () => {
    expect(service.isLoading()).toBe(false);
  });

  it('canAfford() should equal false initially', () => {
    expect(service.canAfford()).toBe(false);
  });

  it('costInfo() should equal null initially', () => {
    expect(service.costInfo()).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Example tests — execute()
// ---------------------------------------------------------------------------

describe('UpgradeService — example tests', () => {
  let service: UpgradeService;
  let updateCurrencySpy: ReturnType<typeof makeUpdateCurrencySpy>;
  let snackBarSpy: ReturnType<typeof makeSnackBarSpy>;

  function setDefaultCostFn(cost = 100, currency: CurrencyName = CURRENCY_NAMES.gold) {
    service.getCostFn.set(() => ({ cost, currency }));
  }

  beforeEach(() => {
    ({ service, updateCurrencySpy, snackBarSpy } = setupTestBed());
    setDefaultCostFn();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    vi.useRealTimers();
  });

  it('execute with successful observable: snackbar "Upgraded!" is opened', () => {
    vi.useFakeTimers();

    service.execute(of({}), () => {});
    vi.advanceTimersByTime(1000);

    expect(snackBarSpy.open).toHaveBeenCalledWith('Upgraded!', 'Great!', expect.anything());
  });

  it('execute with successful observable: onSuccess is called exactly once', () => {
    vi.useFakeTimers();

    const onSuccess = vi.fn();

    service.execute(of({}), onSuccess);
    vi.advanceTimersByTime(1000);

    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it('execute with error observable: snackbar "Upgrade failed!" is opened', () => {
    vi.useFakeTimers();

    service.execute(
      throwError(() => new Error('fail')),
      () => {},
    );
    vi.advanceTimersByTime(1000);

    expect(snackBarSpy.open).toHaveBeenCalledWith('Upgrade failed!', 'Close', expect.anything());
  });

  it('execute with error observable: onSuccess is NOT called', () => {
    vi.useFakeTimers();

    const onSuccess = vi.fn();

    service.execute(
      throwError(() => new Error('fail')),
      onSuccess,
    );
    vi.advanceTimersByTime(1000);

    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('isLoading() is true immediately after execute is called (before observable completes)', () => {
    const subject = new Subject<unknown>();

    service.execute(subject.asObservable(), () => {});

    expect(service.isLoading()).toBe(true);

    subject.complete();
  });

  it('isLoading() is false after the chain completes (after delay(1000))', () => {
    vi.useFakeTimers();

    service.execute(of({}), () => {});

    expect(service.isLoading()).toBe(true);

    vi.advanceTimersByTime(1000);

    expect(service.isLoading()).toBe(false);
  });

  it('updateCurrency is called with correct delta for gold', () => {
    vi.useFakeTimers();

    const cost = 250;

    service.getCostFn.set(() => ({ cost, currency: CURRENCY_NAMES.gold }));
    service.execute(of({}), () => {});
    vi.advanceTimersByTime(1000);

    expect(updateCurrencySpy).toHaveBeenCalledWith({ gold: -cost, silver: 0, copper: 0 });
  });

  it('updateCurrency is called with correct delta for silver', () => {
    vi.useFakeTimers();

    const cost = 500;

    service.getCostFn.set(() => ({ cost, currency: CURRENCY_NAMES.silver }));
    service.execute(of({}), () => {});
    vi.advanceTimersByTime(1000);

    expect(updateCurrencySpy).toHaveBeenCalledWith({ gold: 0, silver: -cost, copper: 0 });
  });

  it('updateCurrency is called with correct delta for copper', () => {
    vi.useFakeTimers();

    const cost = 1000;

    service.getCostFn.set(() => ({ cost, currency: CURRENCY_NAMES.copper }));
    service.execute(of({}), () => {});
    vi.advanceTimersByTime(1000);

    expect(updateCurrencySpy).toHaveBeenCalledWith({ gold: 0, silver: 0, copper: -cost });
  });
});

// ---------------------------------------------------------------------------
// Property-based tests
// ---------------------------------------------------------------------------

describe('UpgradeService — property-based tests', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
    vi.useRealTimers();
  });

  // Feature: upgrade-service, Property 2: currency delta mapping
  // Validates: Requirements 1.3, 2.3, 2.4, 2.5
  it('Property 2: updateCurrency receives correct delta for any EquipmentUpgradeCost', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...currencyNames),
        fc.integer({ min: 1, max: 1000 }),
        (currency, cost) => {
          const updateCurrencySpy = makeUpdateCurrencySpy();
          const { service } = setupTestBed(updateCurrencySpy);

          vi.useFakeTimers();

          const costInfo: EquipmentUpgradeCost = { cost, currency };

          service.getCostFn.set(() => costInfo);
          service.execute(of({}), () => {});
          vi.advanceTimersByTime(1000);

          const expectedDelta: Currency = {
            gold: currency === CURRENCY_NAMES.gold ? -cost : 0,
            silver: currency === CURRENCY_NAMES.silver ? -cost : 0,
            copper: currency === CURRENCY_NAMES.copper ? -cost : 0,
          };

          expect(updateCurrencySpy).toHaveBeenCalledWith(expectedDelta);

          vi.useRealTimers();
          TestBed.resetTestingModule();
        },
      ),
      { numRuns: PBT_RUNS },
    );
  });

  // Feature: upgrade-service, Property 6: costInfo derivation
  // Validates: Requirements 3.5
  it('Property 6: costInfo() equals getCostFn()(currentLevel()) for any level and getCostFn', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 199 }),
        fc.constantFrom(...currencyNames),
        fc.integer({ min: 1, max: 1000 }),
        (level, currency, cost) => {
          const { service } = setupTestBed();

          const expectedCostInfo: EquipmentUpgradeCost = { cost, currency };
          const getCostFn = (_level: number): EquipmentUpgradeCost => expectedCostInfo;

          service.currentLevel.set(level);
          service.getCostFn.set(getCostFn);

          expect(service.costInfo()).toStrictEqual(getCostFn(service.currentLevel()));

          TestBed.resetTestingModule();
        },
      ),
      { numRuns: PBT_RUNS },
    );
  });

  // Feature: upgrade-service, Property 7: canAfford correctness
  // Validates: Requirements 3.6, 4.1
  it('Property 7: canAfford() correctly reflects whether currency covers the cost', () => {
    fc.assert(
      fc.property(
        fc.record({
          gold: fc.integer({ min: 0, max: 10000 }),
          silver: fc.integer({ min: 0, max: 10000 }),
          copper: fc.integer({ min: 0, max: 10000 }),
        }),
        fc.constantFrom(...currencyNames),
        fc.integer({ min: 1, max: 1000 }),
        (currencyValues, costCurrency, cost) => {
          const { service } = setupTestBed();

          const costInfo: EquipmentUpgradeCost = { cost, currency: costCurrency };

          service.currency.set(currencyValues);
          service.getCostFn.set(() => costInfo);

          const expected = currencyValues[costCurrency] >= cost;

          expect(service.canAfford()).toBe(expected);

          TestBed.resetTestingModule();
        },
      ),
      { numRuns: PBT_RUNS },
    );
  });

  it('Property 7 (null case): canAfford() is false when getCostFn returns null', () => {
    fc.assert(
      fc.property(
        fc.record({
          gold: fc.integer({ min: 0, max: 10000 }),
          silver: fc.integer({ min: 0, max: 10000 }),
          copper: fc.integer({ min: 0, max: 10000 }),
        }),
        currencyValues => {
          const { service } = setupTestBed();

          service.currency.set(currencyValues);
          service.getCostFn.set(() => null);

          expect(service.canAfford()).toBe(false);

          TestBed.resetTestingModule();
        },
      ),
      { numRuns: PBT_RUNS },
    );
  });
});
