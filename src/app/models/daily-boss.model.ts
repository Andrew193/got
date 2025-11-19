import { IdEntity, LastLogin } from './common.model';

export interface DailyBossConfig extends IdEntity, LastLogin {
  userId: string;
}
