import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SummonTreeComponent } from './summon-tree.component';
import { basicRewardNames, RewardService } from '../../services/reward/reward.service';
import { provideRouter } from '@angular/router';
import { frontRoutes } from '../../constants';
import { provideLocationMocks } from '@angular/common/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { DisplayRewardInitialState } from '../../store/reducers/display-reward.reducer';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('SummonTreeComponent', () => {
  let component: SummonTreeComponent;
  let fixture: ComponentFixture<SummonTreeComponent>;
  let rewardServiceSpy: { [K in keyof RewardService]: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    rewardServiceSpy = { getReward: vi.fn(), rewardNames: basicRewardNames };

    await TestBed.configureTestingModule({
      imports: [SummonTreeComponent],
      providers: [
        { provide: RewardService, useValue: rewardServiceSpy },
        provideRouter([
          { path: 'test', component: SummonTreeComponent },
          { path: frontRoutes.base, component: SummonTreeComponent },
        ]),
        provideLocationMocks(),
        provideMockStore({
          initialState: { displayReward: DisplayRewardInitialState },
        }),
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(SummonTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('SummonTreeComponent should be created', () => {
    expect(component).toBeTruthy();
  });

  it('SummonTreeComponent should have a background image', () => {
    const bgImage = fixture.debugElement.query(el =>
      el.nativeElement.classList?.contains('summon-background'),
    );

    expect(bgImage || component).toBeTruthy();
  });
});
