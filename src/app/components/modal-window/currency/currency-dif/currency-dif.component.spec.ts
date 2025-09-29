import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CurrencyDifComponent } from './currency-dif.component';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';
import { By } from '@angular/platform-browser';
import { RewardCoinComponent } from '../../../views/reward-coin/reward-coin.component';
import { Currency } from '../../../../services/users/users.interfaces';
import { DebugElement } from '@angular/core';

describe('CurrencyDifComponent', () => {
  let component: CurrencyDifComponent;
  let fixture: ComponentFixture<CurrencyDifComponent>;
  let matSnackBarRef: jasmine.SpyObj<MatSnackBarRef<any>>;
  const oldCoins: Currency = {
    gold: 10,
    silver: 100,
    cooper: 1000,
  };
  const newCoins: Currency = {
    gold: 10,
    silver: 100,
    cooper: 1000,
  };

  beforeEach(async () => {
    matSnackBarRef = jasmine.createSpyObj('MatSnackBarRef', ['dismissWithAction']);

    await TestBed.configureTestingModule({
      imports: [CurrencyDifComponent],
      providers: [
        {
          provide: MatSnackBarRef,
          useValue: matSnackBarRef,
        },
        {
          provide: MAT_SNACK_BAR_DATA,
          useValue: {
            old: oldCoins,
            new: newCoins,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CurrencyDifComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('CurrencyDifComponent should be created', () => {
    expect(component).toBeTruthy();
  });

  it('CurrencyDifComponent should get difference', () => {
    const differenceElements = fixture.debugElement
      .query(By.css('.difference'))
      .queryAll(By.directive(RewardCoinComponent))
      .map(el => el.componentInstance as RewardCoinComponent)
      .map(el => el.coinConfig());

    expect(differenceElements.reduce((prev, curr) => prev + curr.amount, 0)).toBe(0);
  });

  it('CurrencyDifComponent should show New and Old Coins', () => {
    function resolve(db: DebugElement) {
      return db
        .queryAll(By.directive(RewardCoinComponent))
        .map(el => el.componentInstance as RewardCoinComponent)
        .map(el => el.coinConfig());
    }

    const newElements = resolve(fixture.debugElement.query(By.css('.new')));
    const oldElements = resolve(fixture.debugElement.query(By.css('.old')));

    expect(newElements.length).toBe(3);
    expect(oldElements.length).toBe(3);

    const newCoinsAmount = newElements.map(el => el.amount).sort();
    const oldCoinsAmount = oldElements.map(el => el.amount).sort();

    expect(newCoinsAmount).toEqual([newCoins.gold, newCoins.silver, newCoins.cooper].sort());
    expect(oldCoinsAmount).toEqual([oldCoins.gold, oldCoins.silver, oldCoins.cooper].sort());
  });
});
