import { inject, Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { NumbersService } from '../../../services/numbers/numbers.service';

type Cur = 'COOPER' | 'SILVER' | 'GOLD';

interface CurMeta {
  valueInCooper: number;
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
    cooper: 'Cooper',
    silver: 'Silver',
    days: 'Duration',
  };

  readonly depositOptions = [3, 10, 25, 120, 365];

  private numberServices = inject(NumbersService);

  private readonly META: Record<Cur, CurMeta> = {
    COOPER: { valueInCooper: 1, decimals: 0, label: 'Cooper' },
    SILVER: { valueInCooper: 6000, decimals: 0, label: 'Silver' },
    GOLD: { valueInCooper: 12000, decimals: 0, label: 'Gold' },
  };
  private readonly SPREAD = 0.99; // Interest

  readonly currencies: Cur[] = ['COOPER', 'SILVER', 'GOLD'];

  form = this.fb.group({
    from: ['COOPER' as Cur, Validators.required],
    to: ['GOLD' as Cur, Validators.required],
    amount: [0, [Validators.required, Validators.min(1)]],
  });

  depositForm = this.fb.group({
    days: [0, [Validators.required]],
    cooper: [0, []],
    silver: [0, []],
    gold: [0, []],
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

    const vFrom = this.META[from].valueInCooper;
    const vTo = this.META[to].valueInCooper;

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

  onFromChanged() {
    const from = this.form.controls.from.value as Cur;

    if (from === this.form.controls.to.value) {
      const next = this.currencies.find(c => c !== from)!;

      this.form.controls.to.setValue(next as Cur);
    }
  }

  allowedToOptions(from: Cur | null): Cur[] {
    return from ? this.currencies.filter(c => c !== from) : [];
  }
}
