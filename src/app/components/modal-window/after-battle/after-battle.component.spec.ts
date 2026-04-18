import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { AfterBattleComponent } from './after-battle.component';
import { DYNAMIC_COMPONENT_DATA } from '../../../models/tokens';
import { RewardService } from '../../../services/reward/reward.service';
import { CurrencyHelperService } from '../../../services/users/currency/helper/currency-helper.service';

describe('AfterBattleComponent', () => {
  let component: AfterBattleComponent;
  let fixture: ComponentFixture<AfterBattleComponent>;

  const mockData = {
    headerClass: 'green-b',
    headerMessage: 'You won',
    labels: { closeBtnLabel: 'Great' },
    reward: { gold: 74, silver: 71, copper: 154461 },
    close: jasmine.createSpy('close'),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AfterBattleComponent],
      providers: [
        { provide: DYNAMIC_COMPONENT_DATA, useValue: mockData },
        {
          provide: RewardService,
          useValue: {
            mostResentRewardCurrency: {},
            resetMostResentRewardCurrency: jasmine.createSpy(),
          },
        },
        {
          provide: CurrencyHelperService,
          useValue: { convertCurrencyToCoin: jasmine.createSpy().and.returnValue([]) },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(AfterBattleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create without throwing', () => {
    expect(component).toBeTruthy();
  });

  it('renders headerMessage from data', () => {
    const h4 = fixture.nativeElement.querySelector('h4');

    expect(h4.textContent.trim()).toBe('You won');
  });

  it('renders closeBtnLabel from data.labels', () => {
    const button = fixture.nativeElement.querySelector('button.got-toggle');

    expect(button.textContent.trim()).toBe('Great');
  });

  it('calls data.close when button is clicked', () => {
    const button = fixture.nativeElement.querySelector('button.got-toggle');

    button.click();
    expect(mockData.close).toHaveBeenCalledWith(true);
  });
});
