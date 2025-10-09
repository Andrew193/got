import { IdEntity, LastLogin } from './common.model';

export interface GiftConfig extends IdEntity, LastLogin {
  userId: string;
}
