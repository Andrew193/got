import { QuestDefinition, QuestId } from './server/types';

export const DAILY_QUESTS: QuestDefinition[] = [
  {
    id: QuestId.campaign_fight,
    title: 'Fight a battle in the Campaign',
    reward: { copper: 500, silver: 10, gold: 1 },
  },
  {
    id: QuestId.campaign_win,
    title: 'Win 1 battle in the Campaign',
    reward: { copper: 1000, silver: 25, gold: 5 },
  },
  {
    id: QuestId.campaign_chest,
    title: 'Collect 1 chest in the Campaign',
    reward: { copper: 2000, silver: 15, gold: 15 },
  },
  {
    id: QuestId.boss_fight,
    title: 'Fight the Daily Boss',
    reward: { copper: 1500, silver: 15, gold: 5 },
  },
  {
    id: QuestId.gift_reward,
    title: 'Collect Gift reward',
    reward: { copper: 800, silver: 10, gold: 1 },
  },
  {
    id: QuestId.training_win,
    title: 'Conduct a Training',
    reward: { copper: 300, silver: 1, gold: 1 },
  },
  {
    id: QuestId.upgrade_equipment,
    title: 'Increase the equipment level of any hero',
    reward: { copper: 600, silver: 10, gold: 1 },
  },
  {
    id: QuestId.upgrade_hero_level,
    title: 'Increase the level of any hero by 1',
    reward: { copper: 700, silver: 15, gold: 5 },
  },
];
