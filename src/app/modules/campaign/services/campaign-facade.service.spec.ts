import { TestBed } from '@angular/core/testing';
import * as fc from 'fast-check';

import { BossDifficulty } from '../../../services/facades/daily-boss/daily-boss.service';
import { HeroesNamesCodes } from '../../../models/units-related/unit.model';
import { CampaignFacadeService } from './campaign-facade.service';

const PBT_RUNS = 20;

describe('CampaignFacadeService', () => {
  let facade: CampaignFacadeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    facade = TestBed.inject(CampaignFacadeService);
  });

  // Feature: campaign-system, Property 1: Полнота конфигурации экранов
  // Validates: Requirements 3.1, 4.1, 5.1
  it('should return exactly 5 screens with 6 battles each for any difficulty', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          BossDifficulty.easy,
          BossDifficulty.normal,
          BossDifficulty.hard,
          BossDifficulty.very_hard,
        ),
        difficulty => {
          const screens = facade.getScreens(difficulty);

          expect(screens.length).toBe(5);
          screens.forEach(screen => expect(screen.length).toBe(6));
        },
      ),
      { numRuns: PBT_RUNS },
    );
  });

  // Feature: campaign-system, Property 2: Монотонная прогрессия сложности внутри экрана
  // Validates: Requirements 5.3, 5.4
  it('should have strictly increasing levels within a screen, boss level exceeds all regular battles', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          BossDifficulty.easy,
          BossDifficulty.normal,
          BossDifficulty.hard,
          BossDifficulty.very_hard,
        ),
        fc.integer({ min: 0, max: 4 }),
        (difficulty, screenIndex) => {
          const battles = facade.getScreens(difficulty)[screenIndex];
          const regular = battles.slice(0, 5);
          const boss = battles[5];

          for (let i = 1; i < regular.length; i++) {
            expect(regular[i].baseOpponent.level).toBeGreaterThan(
              regular[i - 1].baseOpponent.level,
            );
          }

          regular.forEach(b =>
            expect(boss.baseOpponent.level).toBeGreaterThan(b.baseOpponent.level),
          );
        },
      ),
      { numRuns: PBT_RUNS },
    );
  });

  // Feature: campaign-system, Property 3: Монотонная прогрессия наград по экранам
  // Validates: Requirements 9.2
  it('should have strictly increasing rewards across screens for any difficulty', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          BossDifficulty.easy,
          BossDifficulty.normal,
          BossDifficulty.hard,
          BossDifficulty.very_hard,
        ),
        fc.integer({ min: 1, max: 4 }),
        (difficulty, screenIndex) => {
          const screens = facade.getScreens(difficulty);
          const prevReward = screens[screenIndex - 1][0].reward;
          const currReward = screens[screenIndex][0].reward;

          expect(currReward.copper).toBeGreaterThan(prevReward.copper);
          expect(currReward.silver).toBeGreaterThan(prevReward.silver);
          expect(currReward.gold).toBeGreaterThan(prevReward.gold);
        },
      ),
      { numRuns: PBT_RUNS },
    );
  });

  // Feature: campaign-system, Property 4: Монотонная прогрессия наград по сложности
  // Validates: Requirements 9.3
  it('should have strictly increasing rewards across difficulties for any screen', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(BossDifficulty.normal, BossDifficulty.hard, BossDifficulty.very_hard),
        fc.integer({ min: 0, max: 4 }),
        (difficulty, screenIndex) => {
          const prevDifficulty = (difficulty - 1) as BossDifficulty;
          const prevReward = facade.getScreens(prevDifficulty)[screenIndex][0].reward;
          const currReward = facade.getScreens(difficulty)[screenIndex][0].reward;

          expect(currReward.copper).toBeGreaterThan(prevReward.copper);
          expect(currReward.silver).toBeGreaterThan(prevReward.silver);
          expect(currReward.gold).toBeGreaterThan(prevReward.gold);
        },
      ),
      { numRuns: PBT_RUNS },
    );
  });

  // Feature: campaign-system, Property 5: Награда босса превышает награду обычного боя
  // Validates: Requirements 9.4
  it('should have boss reward strictly greater than any regular battle reward in the same screen', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          BossDifficulty.easy,
          BossDifficulty.normal,
          BossDifficulty.hard,
          BossDifficulty.very_hard,
        ),
        fc.integer({ min: 0, max: 4 }),
        (difficulty, screenIndex) => {
          const battles = facade.getScreens(difficulty)[screenIndex];
          const bossReward = battles[5].reward;

          battles.slice(0, 5).forEach(b => {
            expect(bossReward.copper).toBeGreaterThan(b.reward.copper);
            expect(bossReward.silver).toBeGreaterThan(b.reward.silver);
            expect(bossReward.gold).toBeGreaterThan(b.reward.gold);
          });
        },
      ),
      { numRuns: PBT_RUNS },
    );
  });

  // Feature: campaign-system, Property 6: Случайный выбор противников — размер результата
  // Validates: Requirements 11.1, 11.4
  it('should return min(aiUnitsCount, pool.length) opponents, all from pool', () => {
    fc.assert(
      fc.property(
        fc.array(fc.constantFrom(...Object.values(HeroesNamesCodes)), {
          minLength: 1,
          maxLength: 10,
        }),
        fc.integer({ min: 1, max: 8 }),
        (pool, aiUnitsCount) => {
          const result = facade.selectOpponents(pool, aiUnitsCount);

          expect(result.length).toBe(Math.min(aiUnitsCount, pool.length));
          result.forEach(unit => expect(pool).toContain(unit));
        },
      ),
      { numRuns: PBT_RUNS },
    );
  });

  // Feature: campaign-system, Property 10: Оборудование при hard/very_hard
  // Validates: Requirements 5.6
  it('should have all eq levels > 0 for hard and very_hard difficulties', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(BossDifficulty.hard, BossDifficulty.very_hard),
        fc.integer({ min: 0, max: 4 }),
        fc.integer({ min: 0, max: 5 }),
        (difficulty, screenIndex, battleIndex) => {
          const battle = facade.getScreens(difficulty)[screenIndex][battleIndex];
          const { eq1Level, eq2Level, eq3Level, eq4Level } = battle.baseOpponent;

          expect(eq1Level).toBeGreaterThan(0);
          expect(eq2Level).toBeGreaterThan(0);
          expect(eq3Level).toBeGreaterThan(0);
          expect(eq4Level).toBeGreaterThan(0);
        },
      ),
      { numRuns: PBT_RUNS },
    );
  });
});
