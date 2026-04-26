import { DisplayReward } from '../../reward/reward.service';
import { Currency } from '../../users/users.interfaces';
import { CoinNames } from '../../../models/reward-based.model';
import { CURRENCY_NAMES } from '../../../constants';

export type AggregatedShardEntry = {
  heroImgSrc: string;
  amount: number;
};

export type AggregatedRewards = {
  currency: Partial<Currency>;
  shards: Map<string, AggregatedShardEntry>;
};

export function aggregateRewards(rewards: DisplayReward[]): AggregatedRewards {
  const currency: Partial<Currency> = {};
  const shards = new Map<string, AggregatedShardEntry>();

  for (const reward of rewards) {
    const nameLower = reward.name.toLowerCase();

    if (
      nameLower === CURRENCY_NAMES.copper ||
      nameLower === CURRENCY_NAMES.silver ||
      nameLower === CURRENCY_NAMES.gold
    ) {
      const key = nameLower as CoinNames;

      currency[key] = (currency[key] ?? 0) + reward.amount;
    } else if (nameLower === 'shards') {
      const existing = shards.get(reward.src);

      if (existing) {
        existing.amount += reward.amount;
      } else {
        shards.set(reward.src, { heroImgSrc: reward.src, amount: reward.amount });
      }
    }
  }

  return { currency, shards };
}

export type NetCurrencyResult = { valid: true; net: Currency } | { valid: false; error: string };

/**
 * Calculates the net currency balance after a summon.
 * Deducts summon cost from the costCurrency, adds earned amounts for all currencies.
 * Returns { valid: false } if the net balance for costCurrency would be negative.
 */
export function calculateNetCurrency(
  balance: Currency,
  price: number,
  earned: Partial<Currency>,
  costCurrency: CoinNames,
): NetCurrencyResult {
  const currencies: CoinNames[] = [
    CURRENCY_NAMES.copper,
    CURRENCY_NAMES.silver,
    CURRENCY_NAMES.gold,
  ];
  const net: Currency = {
    [CURRENCY_NAMES.copper]: 0,
    [CURRENCY_NAMES.silver]: 0,
    [CURRENCY_NAMES.gold]: 0,
  };

  for (const v of currencies) {
    if (v === costCurrency) {
      net[v] = balance[v] - price + (earned[v] ?? 0);
    } else {
      net[v] = balance[v] + (earned[v] ?? 0);
    }
  }

  if (net[costCurrency] < 0) {
    return { valid: false, error: `Insufficient ${costCurrency} to perform summon` };
  }

  return { valid: true, net };
}
