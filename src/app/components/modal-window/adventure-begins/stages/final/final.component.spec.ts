/**
 * Bug Condition Exploration Test — Task 1
 *
 * Property 1: Bug Condition — Hero Unlock Called Before User Creation
 *
 * Validates: Requirements 1.1, 1.2
 *
 * CRITICAL: This test is EXPECTED TO FAIL on unfixed code.
 * Failure confirms the bug: `unlockHero` is called with an empty `userId`
 * during `FinalComponent.runScene()` because `localStorageService.getUserId()`
 * returns `""` at the time the scene runs — before `usersService.createUser()`
 * has been called.
 *
 * isBugCondition(X) where:
 *   X.createUser = true
 *   X.userCreatedInDb = false
 *   X.unlockHeroCalledAt = Phase.FinalScene
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';

import { FinalComponent } from './final.component';
import { HeroProgressService } from '../../../../../services/facades/hero-progress/hero-progress.service';
import { LocalStorageService } from '../../../../../services/localStorage/local-storage.service';
import { HeroesNamesCodes } from '../../../../../models/units-related/unit.model';
import { SceneNames, BASIC_CURRENCY } from '../../../../../constants';
import { SceneContext } from '../../../../../models/interfaces/scenes/scene.interface';
import { CurrencyHelperService } from '../../../../../services/users/currency/helper/currency-helper.service';
import { DisplayRewardInitialState } from '../../../../../store/reducers/display-reward.reducer';
import { DisplayRewardActions } from '../../../../../store/actions/display-reward.actions';
import { DisplayRewardNames, StoreNames } from '../../../../../store/store.interfaces';

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

const ALL_HERO_CODES = Object.values(HeroesNamesCodes);

function buildBottomSheetData(heroName: HeroesNamesCodes): SceneContext<SceneNames.firstBattle> {
  return { name: heroName, reward: BASIC_CURRENCY, repeat: false };
}

function buildProviders(
  heroName: HeroesNamesCodes,
  unlockHeroSpy: ReturnType<typeof vi.fn>,
  getUserIdReturn: string,
) {
  return [
    provideMockStore({
      initialState: { [StoreNames.displayReward]: DisplayRewardInitialState },
    }),
    { provide: MAT_BOTTOM_SHEET_DATA, useValue: buildBottomSheetData(heroName) },
    { provide: MatBottomSheetRef, useValue: { dismiss: vi.fn() } },
    { provide: HeroProgressService, useValue: { unlockHero: unlockHeroSpy } },
    {
      provide: LocalStorageService,
      useValue: { getUserId: vi.fn().mockReturnValue(getUserIdReturn) },
    },
    CurrencyHelperService,
  ];
}

// ---------------------------------------------------------------------------
// Task 1 — Bug Condition Exploration
// ---------------------------------------------------------------------------

describe('FinalComponent — Bug Condition Exploration (Task 1)', () => {
  // Captured arguments passed to unlockHero
  let unlockHeroSpy: ReturnType<typeof vi.fn>;
  let localStorageServiceMock: Partial<LocalStorageService>;

  const mockBottomSheetData: SceneContext<SceneNames.firstBattle> = {
    name: HeroesNamesCodes.WhiteWolf,
    reward: BASIC_CURRENCY,
    repeat: false,
  };

  const mockBottomSheetRef = {
    dismiss: vi.fn(),
  };

  beforeEach(async () => {
    unlockHeroSpy = vi.fn().mockReturnValue(of({}));

    // Mock LocalStorageService to return "" — simulating the bug condition:
    // getUserId() returns empty string because createUser hasn't been called yet
    localStorageServiceMock = {
      getUserId: vi.fn().mockReturnValue(''),
    };

    await TestBed.configureTestingModule({
      imports: [FinalComponent],
      providers: [
        provideMockStore({
          initialState: {
            [StoreNames.displayReward]: DisplayRewardInitialState,
          },
        }),
        {
          provide: MAT_BOTTOM_SHEET_DATA,
          useValue: mockBottomSheetData,
        },
        {
          provide: MatBottomSheetRef,
          useValue: mockBottomSheetRef,
        },
        {
          provide: HeroProgressService,
          useValue: {
            unlockHero: unlockHeroSpy,
          },
        },
        {
          provide: LocalStorageService,
          useValue: localStorageServiceMock,
        },
        CurrencyHelperService,
      ],
    }).compileComponents();
  });

  /**
   * Bug Condition Test:
   *
   * When getUserId() returns "" (empty string) — the state during new-user onboarding
   * before createUser completes — runScene() calls unlockHero with that empty userId.
   *
   * This test FAILS on unfixed code because unlockHero IS called with "" as userId,
   * confirming the bug: isBugCondition(X) holds.
   *
   * Counterexample documented: unlockHero("", "White Wolf") is called
   * → POST /api/heroes/progress//unlock returns 404/400
   */
  it('should NOT call unlockHero with empty userId during runScene (bug: it does call it with "")', () => {
    const fixture = TestBed.createComponent(FinalComponent);
    const component = fixture.componentInstance;

    component.runScene();

    // Assert the bug condition: unlockHero should NOT be called with an empty userId.
    // On UNFIXED code this assertion FAILS because unlockHero IS called with "".
    // That failure IS the confirmation that the bug exists.
    expect(unlockHeroSpy).not.toHaveBeenCalledWith('', HeroesNamesCodes.WhiteWolf);
  });
});

// ---------------------------------------------------------------------------
// Task 2 — Preservation: Reward Dispatch
// ---------------------------------------------------------------------------

/**
 * Property 2: Preservation — Reward Dispatch Unchanged
 *
 * Validates: Requirements 3.4
 *
 * For any valid HeroesNamesCodes value passed as data.name, assert that
 * dispatchRewards() is called and DisplayRewardActions.setDisplayRewardState
 * is dispatched to the store.
 *
 * On UNFIXED code: runScene() calls unlockHero first, then on success calls
 * dispatchRewards(). The test verifies the dispatch happens for every hero code.
 *
 * These tests PASS on UNFIXED code — they capture baseline behavior to preserve.
 */
describe('FinalComponent — Preservation: Reward Dispatch (Task 2)', () => {
  /**
   * Helper: configure TestBed for a given heroName and run the test body.
   * unlockHero resolves successfully so dispatchRewards() is always reached
   * on unfixed code.
   */
  async function setupAndRun(heroName: HeroesNamesCodes): Promise<MockStore> {
    const unlockHeroSpy = vi.fn().mockReturnValue(of({}));

    await TestBed.configureTestingModule({
      imports: [FinalComponent],
      providers: buildProviders(heroName, unlockHeroSpy, 'user-123'),
    }).compileComponents();

    const store = TestBed.inject(MockStore);
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    const fixture = TestBed.createComponent(FinalComponent);

    fixture.componentInstance.runScene();

    // Attach the spy reference so callers can assert on it
    (store as any).__dispatchSpy = dispatchSpy;

    return store;
  }

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  /**
   * Iterate over every HeroesNamesCodes value (property-based style).
   * For each hero, verify that after runScene() the store receives a
   * setDisplayRewardState action for the finalLoginButtle context.
   */
  for (const heroName of ALL_HERO_CODES) {
    it(`should dispatch setDisplayRewardState for hero: ${heroName}`, async () => {
      const store = await setupAndRun(heroName);
      const dispatchSpy: ReturnType<typeof vi.spyOn> = (store as any).__dispatchSpy;

      // The dispatch must have been called at least once
      expect(dispatchSpy).toHaveBeenCalled();

      // At least one call must be the setDisplayRewardState action
      // targeting the finalLoginButtle context
      const calls = dispatchSpy.mock.calls.map(c => c[0]);
      const rewardDispatch = calls.find(
        action =>
          action.type === DisplayRewardActions.setDisplayRewardState.type &&
          (action as ReturnType<typeof DisplayRewardActions.setDisplayRewardState>).name ===
            DisplayRewardNames.finalLoginButtle,
      );

      expect(rewardDispatch).toBeDefined();
    });
  }
});
