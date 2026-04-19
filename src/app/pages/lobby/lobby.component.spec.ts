import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LobbyComponent } from './lobby.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { NotificationsService } from '../../services/notifications/notifications.service';
import { DailyRewardService } from '../../services/daily-reward/daily-reward.service';
import { DailyReward } from '../../models/reward-based.model';
import { UsersService } from '../../services/users/users.service';
import { provideMockStore } from '@ngrx/store/testing';

describe('LobbyComponent', () => {
  let component: LobbyComponent;
  let fixture: ComponentFixture<LobbyComponent>;
  let activatedRouteSpy: { [K in keyof ActivatedRoute]: ReturnType<typeof vi.fn> };
  let notificationsServiceSpy: { [K in keyof NotificationsService]: ReturnType<typeof vi.fn> };
  let dailyRewardServiceSpy: { [K in keyof DailyRewardService]: ReturnType<typeof vi.fn> };
  let usersServiceSpy: { [K in keyof UsersService]: ReturnType<typeof vi.fn> };

  const dailyReward: DailyReward = {
    day: 1,
    lastLogin: '',
    totalDays: 0,
    userId: '1',
  };

  beforeEach(async () => {
    usersServiceSpy = { updateCurrency: vi.fn() };
    dailyRewardServiceSpy = {
      monthReward: vi.fn(),
      claimDailyReward: vi.fn(),
      _data: of(dailyReward),
    };
    activatedRouteSpy = { data: of({ test: 'rest' }) };
    notificationsServiceSpy = { getNotification: vi.fn(), $notifications: of(new Map()) };
    notificationsServiceSpy.getNotification.mockImplementation((key: any, notificationMap: any) => {
      return notificationMap ? notificationMap.get(key) : false;
    });

    await TestBed.configureTestingModule({
      imports: [LobbyComponent],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        { provide: NotificationsService, useValue: notificationsServiceSpy },
        { provide: DailyRewardService, useValue: dailyRewardServiceSpy },
        { provide: UsersService, useValue: usersServiceSpy },
        provideMockStore({ initialState: { lobby: { showDailyReward: false } } }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LobbyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('LobbyComponent should be created', () => {
    expect(component).toBeTruthy();
  });
});
