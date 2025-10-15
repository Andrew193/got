import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LobbyComponent } from './lobby.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { NotificationsService } from '../../services/notifications/notifications.service';
import { By } from '@angular/platform-browser';
import { DailyRewardComponent } from '../../components/daily-reward/daily-reward.component';
import { DailyRewardService } from '../../services/daily-reward/daily-reward.service';
import { DailyReward } from '../../models/reward-based.model';
import { UsersService } from '../../services/users/users.service';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatListHarness } from '@angular/material/list/testing';

describe('LobbyComponent', () => {
  let component: LobbyComponent;
  let fixture: ComponentFixture<LobbyComponent>;
  let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;
  let notificationsServiceSpy: jasmine.SpyObj<NotificationsService>;
  let dailyRewardServiceSpy: jasmine.SpyObj<DailyRewardService>;
  let usersServiceSpy: jasmine.SpyObj<UsersService>;
  let loader: HarnessLoader;

  const dailyReward: DailyReward = {
    day: 1,
    lastLogin: '',
    totalDays: 0,
    userId: '1',
  };

  beforeEach(async () => {
    usersServiceSpy = jasmine.createSpyObj('UsersService', ['updateCurrency']);

    dailyRewardServiceSpy = jasmine.createSpyObj(
      'DailyRewardService',
      ['monthReward', 'claimDailyReward'],
      {
        _data: of(dailyReward),
      },
    );

    activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', [''], {
      data: of({ test: 'rest' }),
    });

    notificationsServiceSpy = jasmine.createSpyObj('NotificationsService', ['getNotification'], {
      $notifications: of(new Map()),
    });
    notificationsServiceSpy.getNotification.and.callFake((key, notificationMap) => {
      return notificationMap ? notificationMap.get(key) : false;
    });

    await TestBed.configureTestingModule({
      imports: [LobbyComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: activatedRouteSpy,
        },
        {
          provide: NotificationsService,
          useValue: notificationsServiceSpy,
        },
        {
          provide: DailyRewardService,
          useValue: dailyRewardServiceSpy,
        },
        {
          provide: UsersService,
          useValue: usersServiceSpy,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LobbyComponent);
    component = fixture.componentInstance;

    loader = TestbedHarnessEnvironment.loader(fixture);

    fixture.detectChanges();
  });

  it('LobbyComponent should be created', () => {
    expect(component).toBeTruthy();
  });

  it('LobbyComponent should render basic layout', async () => {
    const matList = await loader.getHarness(MatListHarness);
    const listElements = await matList.getItems();

    const storesContainer = fixture.debugElement.query(By.css('.store-row'))
      .nativeElement as HTMLDivElement;

    expect(listElements.length).toBe(component.pageRoutes.length);
    expect(storesContainer.children.length).toBe(component.activities.length);

    function getLabels(
      collection: HTMLCollection,
      selector: (el: Element) => NodeListOf<HTMLElement>,
    ) {
      return Array.from(collection)
        .map(selector)
        .map(el => Array.from(el).map(el => el.textContent?.trim()))
        .flat();
    }

    const linksLabels = await Promise.all(listElements.map(el => el.getFullText()));
    const storesLabels = getLabels(storesContainer.children, (el: Element) =>
      el.querySelectorAll('.card-title'),
    );

    expect(linksLabels).toEqual(component.pageRoutes.map(el => el.name));
    expect(storesLabels).toEqual(component.activities.map(el => el.name));
  });

  it('LobbyComponent should show daily reward', () => {
    let dailyReward = fixture.debugElement.query(By.directive(DailyRewardComponent));

    expect(dailyReward).toBeNull();

    component.showDailyReward();
    fixture.detectChanges();

    //Show modal
    dailyReward = fixture.debugElement.query(By.directive(DailyRewardComponent));

    expect(dailyReward).toBeTruthy();
  });
});
