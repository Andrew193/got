import { FormControl } from '@angular/forms';
import { Currency } from '../services/users/users.interfaces';

export enum CurEnum {
  COPPER = 'COPPER',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
}

export type Cur = 'COPPER' | 'SILVER' | 'GOLD';

export type DepositInput = {
  max: number;
} & (
  | {
      type: 'copper';
      label: 'Copper:';
    }
  | {
      type: 'silver';
      label: 'Silver:';
    }
  | {
      type: 'gold';
      label: 'Gold:';
    }
);

export interface CurMeta {
  valueInCopper: number;
  decimals: number;
  label: string;
}

export interface Quote {
  from: Cur;
  to: Cur;
  midRate: number;
  rate: number;
  spreadPct: number;
}

export type DepositForm = {
  days: FormControl<number>;
  copper: FormControl<number>;
  silver: FormControl<number>;
  gold: FormControl<number>;
};

export type ExchangerForm = {
  from: FormControl<Cur>;
  to: FormControl<Cur>;
  amount: FormControl<number>;
};

export type DepositConfig = {
  currency: Currency;
  days: number;
};

export type AllowedToOptions = (from: Cur | null) => Cur[];
