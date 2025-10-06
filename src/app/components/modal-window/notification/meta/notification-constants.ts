import { NotificationActivity } from '../../../../models/notification.model';

export const NotificationActivities: NotificationActivity[] = [
  {
    name: 'Gift store',
    flipped: false,
    poster: {
      src: './assets/resourses/imgs/icons/food.png',
      alt: 'gift_store',
    },
    desc: 'You can get copper, gold, silver and chests!!!',
  },
  {
    name: 'Daily reward',
    flipped: false,
    poster: {
      src: './assets/resourses/imgs/UI_Avatar_Unit_Alvar.png',
      alt: 'daily_reward',
    },
    desc: 'You can get your reward. Such as coins, scrolls and books!!!',
  },
  {
    name: 'Daily boss',
    flipped: false,
    poster: {
      src: './assets/resourses/imgs/UI_Avatar_Unit_PolarBear.png',
      alt: 'daily_boss',
    },
    desc: 'You can get even more resources here. Especially if you kill the boss!!',
  },
];
