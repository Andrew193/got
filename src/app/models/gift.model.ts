import { IdEntity } from './common.model';

export interface GiftConfig extends IdEntity {
  userId: string;
  lastLogin: string;
}
