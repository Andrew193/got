import { BossReward } from '../../models/reward-based.model';
import { Currency } from '../../services/users/users.interfaces';

export function calcCampaignReward(reward: BossReward, dmg: number, win: boolean): Currency {
  const times = (d: number, threshold: number) => Math.floor(d / Math.max(threshold, 1));

  debugger;

  return {
    copper: times(dmg, reward.copperDMG) * reward.copper + (win ? reward.copperWin : 0),
    silver: times(dmg, reward.silverDMG) * reward.silver + (win ? reward.silverWin : 0),
    gold: times(dmg, reward.goldDMG) * reward.gold + (win ? reward.goldWin : 0),
  };
}
