import { inject, Injectable } from '@angular/core';
import { Cur, CurEnum, CurMeta, ExchangerForm, Quote } from '../../../models/iron-bank.model';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NumbersService } from '../../../services/numbers/numbers.service';
import { Currency } from '../../../services/users/users.interfaces';

@Injectable({
  providedIn: 'root',
})
export class IronBankExchangerHelperService {
  private numberServices = inject(NumbersService);

  protected readonly META: Record<Cur, CurMeta> = {
    [CurEnum.COPPER]: { valueInCopper: 1, decimals: 0, label: 'Copper' },
    [CurEnum.SILVER]: { valueInCopper: 6000, decimals: 0, label: 'Silver' },
    [CurEnum.GOLD]: { valueInCopper: 12000, decimals: 0, label: 'Gold' },
  };
  protected readonly SPREAD = 0.99; // Interest

  readonly currencies: Cur[] = [CurEnum.COPPER, CurEnum.SILVER, CurEnum.GOLD];

  form = new FormGroup<ExchangerForm>({
    from: new FormControl(CurEnum.COPPER, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    to: new FormControl(CurEnum.GOLD, { nonNullable: true, validators: [Validators.required] }),
    amount: new FormControl(0, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(1)],
    }),
  });

  rateLabel = '';
  result = 0;

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
        (from === CurEnum.COPPER ? amount : 0) +
        (to === CurEnum.COPPER ? newCurrency : 0),
      silver:
        currentCurrency.silver -
        (from === CurEnum.SILVER ? amount : 0) +
        (to === CurEnum.SILVER ? newCurrency : 0),
      gold:
        currentCurrency.gold -
        (from === CurEnum.GOLD ? amount : 0) +
        (to === CurEnum.GOLD ? newCurrency : 0),
    };
  }

  init() {
    this.form.valueChanges.subscribe(() => this.recalc());
    this.recalc();
  }
}
