import { inject, Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NumbersService } from '../../../services/numbers/numbers.service';
import { Currency } from '../../../services/users/users.interfaces';

type Cur = 'COPPER' | 'SILVER' | 'GOLD';

interface CurMeta {
  valueInCopper: number;
  decimals: number;
  label: string;
}

interface Quote {
  from: Cur;
  to: Cur;
  midRate: number;
  rate: number;
  spreadPct: number;
}

@Injectable({
  providedIn: 'root',
})
export class IronBankHelperService {
  readonly uiErrorsNames = {
    amount: 'Amount',
    gold: 'Gold',
    copper: 'Copper',
    silver: 'Silver',
    days: 'Duration',
    from: 'From',
    to: 'To',
  };

  readonly depositOptions = [3, 10, 25, 120, 365];

  private numberServices = inject(NumbersService);

  private readonly META: Record<Cur, CurMeta> = {
    COPPER: { valueInCopper: 1, decimals: 0, label: 'Copper' },
    SILVER: { valueInCopper: 6000, decimals: 0, label: 'Silver' },
    GOLD: { valueInCopper: 12000, decimals: 0, label: 'Gold' },
  };
  private readonly SPREAD = 0.99; // Interest

  readonly currencies: Cur[] = ['COPPER', 'SILVER', 'GOLD'];

  form = new FormGroup({
    from: new FormControl('COPPER' as Cur, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    to: new FormControl('GOLD' as Cur, { nonNullable: true, validators: [Validators.required] }),
    amount: new FormControl(0, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(1)],
    }),
  });

  depositForm = new FormGroup({
    days: new FormControl(0, { nonNullable: true, validators: [Validators.required] }),
    copper: new FormControl(0, { nonNullable: true }),
    silver: new FormControl(0, { nonNullable: true }),
    gold: new FormControl(0, { nonNullable: true }),
  });

  rateLabel = '';
  result = 0;

  constructor(private fb: FormBuilder) {
    this.form.valueChanges.subscribe(() => this.recalc());
    this.recalc();
  }

  private getQuote(from: Cur, to: Cur): Quote {
    if (from === to) {
      return { from, to, midRate: 1, rate: 1, spreadPct: 0 };
    }

    const vFrom = this.META[from].valueInCopper;
    const vTo = this.META[to].valueInCopper;

    const midRate = vFrom / vTo;
    const rate = midRate * (1 - this.SPREAD);

    return { from, to, midRate, rate, spreadPct: this.SPREAD };
  }

  private recalc(): void {
    const { from, to, amount } = this.form.value as {
      from: Cur;
      to: Cur;
      amount: number;
    };

    if (!from || !to || !amount || amount <= 0) {
      this.result = 0;
      this.rateLabel = '';

      return;
    }

    const q = this.getQuote(from, to);
    const rawOut = amount * q.rate;

    this.result = this.numberServices.roundDown(rawOut, this.META[to].decimals);

    const midTxt = q.midRate.toFixed(4);
    const rateTxt = q.rate.toFixed(4);
    const spreadTxt = (q.spreadPct * 100).toFixed(2);

    this.rateLabel = `1 ${this.META[from].label} = ${rateTxt} ${this.META[to].label} (mid ${midTxt}, spread ${spreadTxt}%)`;
  }

  allowedToOptions(from: Cur | null): Cur[] {
    return from ? this.currencies.filter(c => c !== from) : [];
  }

  getCurrencyForExchange(currentCurrency: Currency, newCurrency: number) {
    const amount = this.form.value.amount || 0;
    const from = this.form.value.from;
    const to = this.form.value.to;

    this.form.reset();

    return {
      copper:
        currentCurrency.copper -
        (from === 'COPPER' ? amount : 0) +
        (to === 'COPPER' ? newCurrency : 0),
      silver:
        currentCurrency.silver -
        (from === 'SILVER' ? amount : 0) +
        (to === 'SILVER' ? newCurrency : 0),
      gold:
        currentCurrency.gold - (from === 'GOLD' ? amount : 0) + (to === 'GOLD' ? newCurrency : 0),
    };
  }
}
