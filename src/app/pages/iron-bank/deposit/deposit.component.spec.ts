import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DepositComponent } from './deposit.component';
import { CurrencyHelperService } from '../../../services/users/currency/helper/currency-helper.service';
import { IronBankHelperService } from '../helper/iron-bank-helper.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DepositForm } from '../../../models/iron-bank.model';
import { CURRENCY_NAMES } from '../../../constants';

describe('DepositComponent', () => {
  let component: DepositComponent;
  let fixture: ComponentFixture<DepositComponent>;
  let form;

  beforeEach(async () => {
    form = new FormGroup<DepositForm>({
      days: new FormControl(0, {
        nonNullable: true,
        updateOn: 'blur',
        validators: [Validators.required],
      }),
      [CURRENCY_NAMES.copper]: new FormControl(0, {
        nonNullable: true,
        updateOn: 'blur',
      }),
      [CURRENCY_NAMES.silver]: new FormControl(0, {
        nonNullable: true,
        updateOn: 'blur',
      }),
      [CURRENCY_NAMES.gold]: new FormControl(0, {
        nonNullable: true,
        updateOn: 'blur',
      }),
    });

    await TestBed.configureTestingModule({
      imports: [DepositComponent],
      providers: [CurrencyHelperService, IronBankHelperService],
    }).compileComponents();

    fixture = TestBed.createComponent(DepositComponent);
    fixture.componentRef.setInput('form', form);
    fixture.componentRef.setInput('copperMax', 10000);
    fixture.componentRef.setInput('silverMax', 1000);
    fixture.componentRef.setInput('goldMax', 100);
    fixture.componentRef.setInput('depositOptions', [10, 100, 1000] as const);
    fixture.componentRef.setInput('uiErrorsNames', {
      days: 'days',
      [CURRENCY_NAMES.copper]: CURRENCY_NAMES.copper,
      [CURRENCY_NAMES.silver]: CURRENCY_NAMES.silver,
      [CURRENCY_NAMES.gold]: CURRENCY_NAMES.gold,
    });

    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('DepositComponent should be created', () => {
    expect(component).toBeTruthy();
  });
});
