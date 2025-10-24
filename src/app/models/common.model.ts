import { ALPHABET } from '../constants';

export interface Id {
  id: string;
}

export type IdEntity = Partial<Id> & Record<string, any>;

export interface LastLogin {
  lastLogin: string;
}

export interface DepositDay {
  depositDay: number;
}

export interface GetConfig extends Partial<LastLogin>, Partial<DepositDay> {}

export type Alphabet = (typeof ALPHABET)[number];
