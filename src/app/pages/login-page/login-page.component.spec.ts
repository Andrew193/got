import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginPageComponent } from './login-page.component';
import { LocalStorageService } from '../../services/localStorage/local-storage.service';
import { FakeLocalStorage, fakeUser } from '../../test-related';
import { UsersService } from '../../services/users/users.service';
import { provideLocationMocks } from '@angular/common/testing';
import { provideRouter } from '@angular/router';
import { frontRoutes } from '../../constants';
import { Location } from '@angular/common';
import { By } from '@angular/platform-browser';
import { Observable, of } from 'rxjs';
import { User } from '../../services/users/users.interfaces';
import { InitStep, InitTaskObs } from '../../models/init.model';
import { APP_INIT_STEPS } from '../../injection-tokens';
import { LoginFacadeService } from '../../services/facades/login/login.service';
import { provideHttpClient } from '@angular/common/http';

describe('LoginPageComponent', () => {
  let component: LoginPageComponent;
  let fixture: ComponentFixture<LoginPageComponent>;
  let userServiceSpy: { [K in keyof UsersService]: ReturnType<typeof vi.fn> };
  let location: Location;
  let localStorage: LocalStorageService;
  const initSteps: InitStep[] = [
    {
      name: 'Fake init step',
      task: function (): Observable<InitTaskObs> {
        return of({ ok: true, message: 'Ok' });
      },
    },
  ];
  let facade: { [K in keyof LoginFacadeService]: ReturnType<typeof vi.fn> };

  let inputs: any[];

  beforeEach(async () => {
    facade = { openAdventureBegins: vi.fn() };

    userServiceSpy = { isAuth: vi.fn(), createUser: vi.fn(), login: vi.fn() };

    userServiceSpy.isAuth.mockReturnValue(false);

    function processCreateLogin<T extends (param: User) => void>(
      user: Partial<User>,
      callback: T | undefined,
    ) {
      const toReturn = { ...fakeUser, id: '100', login: user.login, password: user.password };

      callback && callback(toReturn);

      return toReturn;
    }

    userServiceSpy.createUser.mockImplementation((user, callback) => {
      const toReturn = processCreateLogin(user, callback);

      return of(toReturn);
    });

    userServiceSpy.login.mockImplementation((user, callback) => {
      const toReturn = processCreateLogin(user, callback);

      return of([toReturn]);
    });

    await TestBed.configureTestingModule({
      imports: [LoginPageComponent],
      providers: [
        { provide: LocalStorageService, useClass: FakeLocalStorage },
        { provide: UsersService, useValue: userServiceSpy },
        { provide: APP_INIT_STEPS, useValue: initSteps },
        { provide: LoginFacadeService, useValue: facade },
        provideRouter([{ path: frontRoutes.base, component: LoginPageComponent }]),
        provideLocationMocks(),
        provideHttpClient(),
      ],
    }).compileComponents();

    location = TestBed.inject(Location);
    localStorage = TestBed.inject(LocalStorageService);

    fixture = TestBed.createComponent(LoginPageComponent);

    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('LoginPageComponent should be created', () => {
    expect(component).toBeTruthy();
  });

  it('LoginPageComponent should be show default config', () => {
    const switchToggler = fixture.debugElement.query(By.css('.mode-switcher'))
      .nativeElement as HTMLHeadingElement;

    expect(switchToggler.textContent?.trim()).toBe('Come back');
  });

  it('LoginPageComponent should validate the form', async () => {
    expect(component.form.valid).toBe(false);
    expect(component.form.dirty).toBe(false);
  });

  it('LoginPageComponent should create a new user', () => {
    component.form.patchValue({ login: 'test', password: 'rest' });
    fixture.detectChanges();

    expect(userServiceSpy.login).toBeDefined();
  });

  it('LoginPageComponent should switch auth mode and create a user', () => {
    component.switchMode();
    fixture.detectChanges();

    component.form.patchValue({ login: 'create', password: 'create' });
    fixture.detectChanges();

    component.submitInnerFunction();

    expect(userServiceSpy.createUser).toHaveBeenCalled();
  });
});
