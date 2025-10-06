import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { OnlineService } from './online.service';
import { LocalStorageService } from '../localStorage/local-storage.service';
import { UsersService } from '../users/users.service';
import { of } from 'rxjs';
import { createDeepCopy } from '../../helpers';
import { TIME } from './online.contrants';
import { FakeLocalStorage, fakeUser } from '../../test-related';

describe('OnlineService', () => {
  let onlineService: OnlineService;
  let userServiceSpy: jasmine.SpyObj<UsersService>;

  beforeEach(() => {
    const user = createDeepCopy(fakeUser);

    userServiceSpy = jasmine.createSpyObj('UsersService', ['updateOnline']);
    userServiceSpy.updateOnline.and.returnValue(of(user));

    TestBed.configureTestingModule({
      providers: [
        OnlineService,
        { provide: LocalStorageService, useClass: FakeLocalStorage },
        { provide: UsersService, useValue: userServiceSpy },
      ],
    });

    onlineService = TestBed.inject(OnlineService);
  });

  it('OnlineService should be created', () => {
    expect(onlineService).toBeTruthy();
  });

  it('OnlineService should give local buffer', fakeAsync(() => {
    let buffer = onlineService.localBuffer;

    //1) Correct local buffer
    expect(buffer).toBe(TIME.tenMinuteSeconds);

    //2) Login (Send data to backend)
    onlineService.init();

    //Add buffer to the online time
    expect(userServiceSpy.updateOnline).toHaveBeenCalledWith({ time: buffer });

    //Drop buffer after this
    buffer = onlineService.localBuffer;

    expect(buffer).toBe(0);

    userServiceSpy.updateOnline.calls.reset();

    //3) Tick 1 minute
    tick(TIME.oneMinuteMilliseconds);

    buffer = onlineService.localBuffer;
    expect(buffer).toBe(TIME.oneMinuteSeconds);

    //4) Get to 10 minutes
    tick(TIME.oneMinuteMilliseconds * 9);
    expect(userServiceSpy.updateOnline).toHaveBeenCalledWith(
      jasmine.objectContaining({ time: 600 }),
      true,
    );
  }));
});
