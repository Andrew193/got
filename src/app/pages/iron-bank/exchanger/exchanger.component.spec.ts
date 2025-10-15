import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExchangerComponent } from './exchanger.component';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AllowedToOptions, Cur, CurEnum, ExchangerForm } from '../../../models/iron-bank.model';
import { Coin } from '../../../models/reward-based.model';
import { CURRENCY_NAMES } from '../../../constants';

describe('ExchangerComponent', () => {
  let component: ExchangerComponent;
  let fixture: ComponentFixture<ExchangerComponent>;
  const form: FormGroup<ExchangerForm> = new FormGroup<ExchangerForm>({
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
  const coins: Coin[] = [
    {
      class: CURRENCY_NAMES.copper,
      imgSrc: 'copper',
      alt: 'copper_alt',
      amount: 10000,
    },
  ];
  const currencies: Cur[] = [CurEnum.COPPER, CurEnum.SILVER];
  const allowedToOptions: AllowedToOptions = from => {
    const curr = {
      [CurEnum.COPPER as Cur]: [CurEnum.SILVER] as Cur[],
      [CurEnum.SILVER as Cur]: [CurEnum.COPPER] as Cur[],
    };
    const key = (from || (CurEnum.COPPER satisfies Cur)) as Cur;

    return curr[key];
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExchangerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ExchangerComponent);

    fixture.componentRef.setInput('form', form);
    fixture.componentRef.setInput('coins', coins);
    fixture.componentRef.setInput('currencies', currencies);
    fixture.componentRef.setInput('rateLabel', 'Label');
    fixture.componentRef.setInput('result', 0);
    fixture.componentRef.setInput('uiErrorsNames', {
      from: 'from',
      to: 'to',
      amount: 'amount',
    });
    fixture.componentRef.setInput('amountMax', 10000);
    fixture.componentRef.setInput('allowedToOptions', allowedToOptions);

    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('ExchangerComponent should be created.', () => {
    expect(component).toBeTruthy();
  });
});
