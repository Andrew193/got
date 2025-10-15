import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { SummonTreeComponent } from './summon-tree.component';
import {
  basicRewardNames,
  DisplayReward,
  RewardService,
} from '../../services/reward/reward.service';
import { provideRouter } from '@angular/router';
import { frontRoutes } from '../../constants';
import { provideLocationMocks } from '@angular/common/testing';
import { Location } from '@angular/common';
import { By } from '@angular/platform-browser';
import { DisplayRewardComponent } from '../../components/display-reward/display-reward.component';

describe('SummonTreeComponent', () => {
  let component: SummonTreeComponent;
  let fixture: ComponentFixture<SummonTreeComponent>;
  //Providers
  let rewardServiceSpy: jasmine.SpyObj<RewardService>;
  let location: Location;

  beforeEach(async () => {
    rewardServiceSpy = jasmine.createSpyObj('RewardService', ['getReward'], {
      rewardNames: basicRewardNames,
    });

    // @ts-ignore
    rewardServiceSpy.getReward.and.callFake(amountOfRewards => {
      const result: DisplayReward[] = new Array(amountOfRewards)
        .fill({
          name: 'Copper',
          amount: 0,
          src: '',
          flipped: false,
        })
        .map((el, index) => ({ ...el, amount: index * 100 }));

      return result;
    });

    await TestBed.configureTestingModule({
      imports: [SummonTreeComponent],
      providers: [
        { provide: RewardService, useValue: rewardServiceSpy },
        provideRouter([
          { path: 'test', component: SummonTreeComponent },
          { path: frontRoutes.base, component: SummonTreeComponent },
        ]),
        provideLocationMocks(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SummonTreeComponent);
    component = fixture.componentInstance;
    location = TestBed.inject(Location);

    fixture.detectChanges();
  });

  it('SummonTreeComponent should be created', () => {
    expect(component).toBeTruthy();
  });

  it('SummonTreeComponent should redirect to the main page', fakeAsync(() => {
    component.goToMainPage();
    tick();
    expect(location.path()).toBe('/');
  }));

  it('SummonTreeComponent should return a reward', () => {
    expect(component.rewards.length).toBe(0);

    component.getReward();

    expect(component.rewards.length).toBe(1);

    component.getReward(10);

    expect(component.rewards.length).toBe(10);
  });

  it('SummonTreeComponent should have a background image', () => {
    const bgImage = fixture.debugElement.query(By.css('.summon-background'));

    expect(bgImage).toBeTruthy();
  });

  it('SummonTreeComponent should render a reward list', async () => {
    const length = 10;

    component.getReward(length);
    fixture.detectChanges();

    const displayRewardComponent = fixture.debugElement.query(By.directive(DisplayRewardComponent));

    const displayRewardComponentRewards = (
      displayRewardComponent.componentInstance as DisplayRewardComponent
    ).rewards();

    const total = displayRewardComponentRewards.reduce(
      (prev, curr) => prev + (curr?.amount || 0),
      0,
    );
    const totalAmount = new Array(length)
      .fill(0)
      .map((_, index) => index * 100)
      .reduce((prev, curr) => prev + curr, 0);

    expect(displayRewardComponentRewards.length).toBe(length);
    expect(total).toBe(totalAmount);
  });
});
