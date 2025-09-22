export interface StepsReward {
  time: number;
  claimedRewards: string[];
}

export interface NotificationActivity {
  name: string;
  flipped: boolean;
  poster: {
    src: string;
    alt: string;
  };
  desc: string;
}
