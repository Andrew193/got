import { HeroesNamesCodes, UnitConfig } from '../../../models/units-related/unit.model';
import { BossReward } from '../../../models/reward-based.model';
import { BossDifficulty } from '../../../services/abstract/battle-rewards/battle-rewards.service';

export type CampaignBattleConfig = {
  id: string; // уникальный ID: `${difficulty}-s${screen}-b${battle}`
  screenIndex: number; // 0–4
  battleIndex: number; // 0–5 (5 = босс)
  isBoss: boolean; // true для 6-го боя (battleIndex === 5)
  maxUserUnits: number; // 1–5, настраивается per-battle
  aiUnitsCount: number;
  opponentPool: HeroesNamesCodes[]; // пул для случайного выбора
  baseOpponent: UnitConfig & {
    name: HeroesNamesCodes;
    src: string;
  };
  reward: BossReward;
};

export type CampaignScreenConfig = CampaignBattleConfig[];

export type CampaignDifficultyConfig = {
  difficulty: BossDifficulty;
  screens: CampaignScreenConfig[]; // всегда 5 экранов
};
