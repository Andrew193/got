import { NotificationType } from '../services/notifications/notifications.service';

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

export type NotificationConfigMap = Map<NotificationType, boolean>;
