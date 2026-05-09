import { QuestDefinition, QuestId } from './server/types';

export const DAILY_QUESTS: QuestDefinition[] = [
  {
    id: QuestId.campaign_fight,
    title: 'Провести бой в кампании',
    reward: { copper: 500, silver: 10, gold: 1 },
  },
  {
    id: QuestId.campaign_win,
    title: 'Выиграть 1 бой в кампании',
    reward: { copper: 1000, silver: 25, gold: 5 },
  },
  {
    id: QuestId.campaign_chest,
    title: 'Забрать 1 сундук в кампании',
    reward: { copper: 2000, silver: 15, gold: 15 },
  },
  {
    id: QuestId.boss_fight,
    title: 'Провести бой с Боссом',
    reward: { copper: 1500, silver: 15, gold: 5 },
  },
  {
    id: QuestId.gift_reward,
    title: 'Забрать награду в Gift',
    reward: { copper: 800, silver: 10, gold: 1 },
  },
  {
    id: QuestId.training_win,
    title: 'Провести тренировку',
    reward: { copper: 300, silver: 1, gold: 1 },
  },
  {
    id: QuestId.upgrade_equipment,
    title: 'Повысить уровень снаряжения любого героя',
    reward: { copper: 600, silver: 10, gold: 1 },
  },
  {
    id: QuestId.upgrade_hero_level,
    title: 'Повысить уровень любого героя на 1 уровень',
    reward: { copper: 700, silver: 15, gold: 5 },
  },
];
