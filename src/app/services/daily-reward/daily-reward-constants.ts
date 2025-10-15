import { Coin } from '../../models/reward-based.model';
import { CURRENCY_NAMES } from '../../constants';

export const BaseLoyaltyBonus: Coin[] = [
  {
    class: CURRENCY_NAMES.copper,
    imgSrc: 'assets/resourses/imgs/copper.png',
    alt: 'copperCoin',
    amount: 15000,
  },
  {
    class: CURRENCY_NAMES.silver,
    imgSrc: 'assets/resourses/imgs/silver.png',
    alt: 'silverCoin',
    amount: 100,
  },
  {
    class: CURRENCY_NAMES.gold,
    imgSrc: 'assets/resourses/imgs/gold.png',
    alt: 'goldCoin',
    amount: 10,
  },
];
