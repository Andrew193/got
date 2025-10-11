import { FormControl } from '@angular/forms';
import { Currency } from '../services/users/users.interfaces';

export type Cur = 'COPPER' | 'SILVER' | 'GOLD';

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

export type DepositConfig = {
  currency: Currency;
  days: number;
};
