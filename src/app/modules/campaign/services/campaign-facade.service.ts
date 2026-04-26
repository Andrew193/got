import { inject, Injectable } from '@angular/core';
import { HeroesNamesCodes, Rarity, UnitName } from '../../../models/units-related/unit.model';
import { BossReward } from '../../../models/reward-based.model';
import { CampaignBattleConfig, CampaignScreenConfig } from '../models/campaign.models';
import { NavigationService } from '../../../services/facades/navigation/navigation.service';
import { CampaignBattleState } from '../campaign-battlefield/campaign-battlefield.component';
import { HeroesService, HeroesSrcMap } from '../../../services/facades/heroes/heroes.service';
import {
  BattleRewardsService,
  BattleDifficulty,
} from '../../../services/abstract/battle-rewards/battle-rewards.service';
import { FormControl, FormGroup } from '@angular/forms';
import { NumbersService } from '../../../services/numbers/numbers.service';
import { LocalStorageService } from '../../../services/localStorage/local-storage.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CampaignVictoriesService } from './campaign-victories.service';
import { SNACKBAR_CONFIG } from '../../../constants';
import { ApiError } from '../../../models/api.model';
import { ShardsDifComponent } from '../../../components/modal-window/currency/shards-dif/shards-dif.component';

export interface ShardsDifData {
  heroName: HeroesNamesCodes;
  heroImgSrc: string;
  amount: number;
  rarity: Rarity;
}

type DifficultyParams = {
  baseLevelForDifficulty: number;
  screenLevelStep: number;
  battleLevelStep: number;
  bossLevelBonus: number;
  baseRankForDifficulty: number;
  eqNormal: number;
  eqBoss: number;
  eqScreenStep: number;
  rewardMultiplier: number;
};

const DIFFICULTY_PARAMS: Record<BattleDifficulty, DifficultyParams> = {
  [BattleDifficulty.easy]: {
    baseLevelForDifficulty: 1,
    screenLevelStep: 3,
    battleLevelStep: 1,
    bossLevelBonus: 8,
    baseRankForDifficulty: 0,
    eqNormal: 0,
    eqBoss: 0,
    eqScreenStep: 0,
    rewardMultiplier: 1,
  },
  [BattleDifficulty.normal]: {
    baseLevelForDifficulty: 10,
    screenLevelStep: 5,
    battleLevelStep: 2,
    bossLevelBonus: 15,
    baseRankForDifficulty: 1,
    eqNormal: 0,
    eqBoss: 0,
    eqScreenStep: 0,
    rewardMultiplier: 3,
  },
  [BattleDifficulty.hard]: {
    baseLevelForDifficulty: 25,
    screenLevelStep: 8,
    battleLevelStep: 3,
    bossLevelBonus: 20,
    baseRankForDifficulty: 2,
    eqNormal: 50,
    eqBoss: 100,
    eqScreenStep: 10,
    rewardMultiplier: 9,
  },
  [BattleDifficulty.very_hard]: {
    baseLevelForDifficulty: 45,
    screenLevelStep: 12,
    battleLevelStep: 5,
    bossLevelBonus: 30,
    baseRankForDifficulty: 4,
    eqNormal: 100,
    eqBoss: 200,
    eqScreenStep: 20,
    rewardMultiplier: 15,
  },
};

const SCREEN_REWARD_MULTIPLIERS = [1.0, 1.2, 1.3, 1.6, 1.9];

const BASE_REWARD: BossReward = {
  copper: 300,
  copperWin: 1200,
  copperDMG: 15000,
  silver: 2,
  silverWin: 10,
  silverDMG: 20000,
  gold: 1,
  goldWin: 5,
  goldDMG: 35000,
};

const OPPONENT_POOLS: HeroesNamesCodes[][] = [
  [
    HeroesNamesCodes.FreeTrapper,
    HeroesNamesCodes.BrownWolf,
    HeroesNamesCodes.Priest,
    HeroesNamesCodes.WhiteWolf,
  ],
  [
    HeroesNamesCodes.IceRiverHunter,
    HeroesNamesCodes.RelinaShow,
    HeroesNamesCodes.TargaryenKnight,
    HeroesNamesCodes.FreeTrapper,
  ],
  [
    HeroesNamesCodes.WhiteWalkerCapitan,
    HeroesNamesCodes.Giant,
    HeroesNamesCodes.RelinaShow,
    HeroesNamesCodes.IceRiverHunter,
  ],
  [
    HeroesNamesCodes.WhiteWalkerGeneral,
    HeroesNamesCodes.Giant,
    HeroesNamesCodes.WhiteWalkerCapitan,
    HeroesNamesCodes.NightKing,
  ],
  [
    HeroesNamesCodes.NightKing,
    HeroesNamesCodes.WhiteWalkerGeneral,
    HeroesNamesCodes.JonKing,
    HeroesNamesCodes.RedKeepAlchemist,
    HeroesNamesCodes.LadyOfDragonStone,
  ],
];

const BOSS_NAMES: HeroesNamesCodes[] = [
  HeroesNamesCodes.Priest,
  HeroesNamesCodes.TargaryenKnight,
  HeroesNamesCodes.Giant,
  HeroesNamesCodes.WhiteWalkerGeneral,
  HeroesNamesCodes.NightKing,
];

// maxUserUnits for regular battles (battleIndex 0-4)
const MAX_USER_UNITS_REGULAR: Record<BattleDifficulty, number> = {
  [BattleDifficulty.easy]: 1,
  [BattleDifficulty.normal]: 2,
  [BattleDifficulty.hard]: 3,
  [BattleDifficulty.very_hard]: 4,
};

// maxUserUnits for boss battles per screen
const MAX_USER_UNITS_BOSS: number[] = [2, 2, 3, 3, 4];

const VICTORY_THRESHOLD = 10;

const DIFFICULTY_SHARD_RARITY: Record<BattleDifficulty, Rarity> = {
  [BattleDifficulty.easy]: Rarity.COMMON,
  [BattleDifficulty.normal]: Rarity.RARE,
  [BattleDifficulty.hard]: Rarity.EPIC,
  [BattleDifficulty.very_hard]: Rarity.LEGENDARY,
};

@Injectable({ providedIn: 'root' })
export class CampaignFacadeService extends BattleRewardsService {
  private nav = inject(NavigationService);
  private heroService = inject(HeroesService);
  private numberService = inject(NumbersService);
  private localStorageService = inject(LocalStorageService);
  private snackBar = inject(MatSnackBar);
  private victoriesService = inject(CampaignVictoriesService);

  override bossReward: Record<BattleDifficulty, BossReward> = {} as Record<
    BattleDifficulty,
    BossReward
  >;

  readonly wonBattlesForm = new FormGroup({
    easy: new FormControl<number>(0, { nonNullable: true }),
    normal: new FormControl<number>(0, { nonNullable: true }),
    hard: new FormControl<number>(0, { nonNullable: true }),
    very_hard: new FormControl<number>(0, { nonNullable: true }),
  });

  getScreens(difficulty: BattleDifficulty): CampaignScreenConfig[] {
    const params = DIFFICULTY_PARAMS[difficulty];
    const screens: CampaignScreenConfig[] = [];

    for (let screenIndex = 0; screenIndex < 5; screenIndex++) {
      const screen: CampaignBattleConfig[] = [];
      const pool = OPPONENT_POOLS[screenIndex];
      const bossName = BOSS_NAMES[screenIndex];
      const screenMultiplier = SCREEN_REWARD_MULTIPLIERS[screenIndex];

      for (let battleIndex = 0; battleIndex < 6; battleIndex++) {
        const isBoss = battleIndex === 5;

        const level = isBoss
          ? params.baseLevelForDifficulty +
            screenIndex * params.screenLevelStep +
            params.bossLevelBonus
          : params.baseLevelForDifficulty +
            screenIndex * params.screenLevelStep +
            battleIndex * params.battleLevelStep;

        const rank = isBoss
          ? params.baseRankForDifficulty + Math.floor(screenIndex / 2) + 1
          : params.baseRankForDifficulty + Math.floor(screenIndex / 2);

        const eqLevel = isBoss
          ? params.eqBoss + screenIndex * params.eqScreenStep
          : params.eqNormal + screenIndex * params.eqScreenStep;

        const aiUnitsCount = isBoss
          ? 2 + Math.floor(screenIndex / 2)
          : 1 + Math.floor(battleIndex / 2);

        const maxUserUnits = isBoss
          ? MAX_USER_UNITS_BOSS[screenIndex]
          : MAX_USER_UNITS_REGULAR[difficulty];

        const opponentName = isBoss ? bossName : pool[battleIndex % pool.length];

        const opponentPool = isBoss ? [bossName] : pool;

        const reward = this.buildReward(params.rewardMultiplier, screenMultiplier, isBoss);

        screen.push({
          id: `${BattleDifficulty[difficulty]}-s${screenIndex}-b${battleIndex}`,
          screenIndex,
          battleIndex,
          isBoss,
          maxUserUnits,
          aiUnitsCount,
          opponentPool,
          baseOpponent: {
            name: opponentName,
            level,
            rank,
            eq1Level: eqLevel,
            eq2Level: eqLevel,
            eq3Level: eqLevel,
            eq4Level: eqLevel,
            src: HeroesSrcMap[opponentName].imgSrc,
          },
          reward,
        });
      }

      screens.push(screen);
    }

    return screens;
  }

  selectOpponents(pool: HeroesNamesCodes[], aiUnitsCount: number): HeroesNamesCodes[] {
    const count = Math.min(aiUnitsCount, pool.length);
    const shuffled = [...pool].sort(() => Math.random() - 0.5);

    return shuffled.slice(0, count);
  }

  startBattle(
    config: CampaignBattleConfig,
    difficulty: BattleDifficulty,
    userUnits: UnitName[],
    aiUnits: HeroesNamesCodes[],
    userId: string,
  ) {
    const { name, ...aiUnitConfig } = config.baseOpponent;
    const state: CampaignBattleState = {
      isCampaign: true,
      battleId: config.id,
      userId,
      difficulty,
      userUnitNames: userUnits,
      aiUnitNames: aiUnits,
      aiUnitConfig: aiUnitConfig,
      reward: config.reward,
    };

    this.nav.goToCampaignBattle(state);
  }

  private buildReward(
    difficultyMultiplier: number,
    screenMultiplier: number,
    isBoss: boolean,
  ): BossReward {
    const bossMultiplier = isBoss ? 3 : 1;
    const totalMultiplier = difficultyMultiplier * screenMultiplier * bossMultiplier;

    return {
      copper: Math.round(BASE_REWARD.copper * totalMultiplier),
      copperWin: Math.round(BASE_REWARD.copperWin * totalMultiplier),
      copperDMG: Math.round(BASE_REWARD.copperDMG * totalMultiplier),
      silver: Math.round(BASE_REWARD.silver * totalMultiplier),
      silverWin: Math.round(BASE_REWARD.silverWin * totalMultiplier),
      silverDMG: Math.round(BASE_REWARD.silverDMG * totalMultiplier),
      gold: Math.round(BASE_REWARD.gold * totalMultiplier),
      goldWin: Math.round(BASE_REWARD.goldWin * totalMultiplier),
      goldDMG: Math.round(BASE_REWARD.goldDMG * totalMultiplier),
    };
  }

  incrementVictoryCounter(difficulty: BattleDifficulty): void {
    const userId = this.localStorageService.getUserId();
    const diffKey = BattleDifficulty[difficulty] as keyof typeof this.wonBattlesForm.controls;
    const control = this.wonBattlesForm.controls[diffKey];

    this.victoriesService.incrementVictory(userId, difficulty).subscribe({
      next: victories => {
        control.setValue(victories.difficulties[BattleDifficulty[difficulty]] ?? 0);
      },
      error: err => {
        console.error('Failed to increment victory counter:', err);
      },
    });
  }

  loadVictories(): void {
    const userId = this.localStorageService.getUserId();

    this.victoriesService.getVictories(userId).subscribe({
      next: victories => {
        this.wonBattlesForm.setValue({
          easy: victories.difficulties['easy'] ?? 0,
          normal: victories.difficulties['normal'] ?? 0,
          hard: victories.difficulties['hard'] ?? 0,
          very_hard: victories.difficulties['very_hard'] ?? 0,
        });
      },
      error: err => {
        console.error('Failed to load victories:', err);
      },
    });
  }

  collectVictoryReward(difficulty: BattleDifficulty, screenIndex: number): void {
    const diffKey = BattleDifficulty[difficulty] as keyof typeof this.wonBattlesForm.controls;
    const control = this.wonBattlesForm.controls[diffKey];
    const current = control.value;

    if (current < VICTORY_THRESHOLD) {
      return;
    }

    const pool = OPPONENT_POOLS[screenIndex];
    const heroIndex = this.numberService.getNumberInRange(0, pool.length - 1);
    const heroName = pool[heroIndex];
    const heroImgSrc = HeroesSrcMap[heroName].imgSrc;
    const amount = this.numberService.getNumberInRange(0, 10);
    const rarity = DIFFICULTY_SHARD_RARITY[difficulty];
    const userId = this.localStorageService.getUserId();

    this.heroService.heroProgressService.addShards(userId, heroName, amount).subscribe({
      next: () => {
        this.victoriesService.decrementVictory(userId, difficulty, VICTORY_THRESHOLD).subscribe({
          next: victories => {
            control.setValue(victories.difficulties[BattleDifficulty[difficulty]] ?? 0);
          },
        });
        this.snackBar.openFromComponent(ShardsDifComponent, {
          ...SNACKBAR_CONFIG,
          data: { heroName, heroImgSrc, amount, rarity } as ShardsDifData,
        });
      },
      error: (err: ApiError) => {
        this.snackBar.open('Failed to add shards: ' + err.error, 'Ok', SNACKBAR_CONFIG);
        console.error('Failed to add shards:', err);
      },
    });
  }
}
