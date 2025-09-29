import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GiftStoreComponent } from './gift-store.component';
import { GiftService } from '../../services/gift/gift.service';
import { GiftConfig } from '../../models/gift.model';
import { of } from 'rxjs';
import { UsersService } from '../../services/users/users.service';
import { NotificationsService } from '../../services/notifications/notifications.service';
import { ActivatedRoute } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { DisplayRewardComponent } from '../../components/display-reward/display-reward.component';
import { By } from '@angular/platform-browser';
import { fakeUser } from '../../test-related';

describe('GiftStoreComponent', () => {
  let component: GiftStoreComponent;
  let fixture: ComponentFixture<GiftStoreComponent>;
  let giftServiceSpy: jasmine.SpyObj<GiftService>;
  let usersServiceSpy: jasmine.SpyObj<UsersService>;
  let notificationsServiceSpy: jasmine.SpyObj<NotificationsService>;
  let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;

  const dailyReward: GiftConfig = {
    lastLogin: '',
    userId: fakeUser.id,
  };

  beforeEach(async () => {
    giftServiceSpy = jasmine.createSpyObj('GiftService', [''], {
      _data: of(dailyReward),
    });
    usersServiceSpy = jasmine.createSpyObj('UsersService', ['updateCurrency']);
    notificationsServiceSpy = jasmine.createSpyObj('NotificationsService', ['notificationsValue']);
    activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', ['']);

    await TestBed.configureTestingModule({
      imports: [GiftStoreComponent],
      providers: [
        {
          provide: GiftService,
          useValue: giftServiceSpy,
        },
        {
          provide: UsersService,
          useValue: usersServiceSpy,
        },
        {
          provide: NotificationsService,
          useValue: notificationsServiceSpy,
        },
        {
          provide: ActivatedRoute,
          useValue: activatedRouteSpy,
        },
        provideNoopAnimations(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GiftStoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('GiftStoreComponent should be created', () => {
    expect(component).toBeTruthy();
  });

  it('GiftStoreComponent should init layout', () => {
    const displayReward = fixture.debugElement.query(By.directive(DisplayRewardComponent));

    expect(component.aiUnits.every(el => !el.user)).toBeTrue();
    expect(component.userUnits.every(el => el.user)).toBeTrue();
    expect(displayReward).toBeNull();
    expect(component.loot.length).toBe(0);
  });
});
