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
import { FormErrorsContainerComponent } from '../../components/form/form-errors-container/form-errors-container.component';
import { of } from 'rxjs';
import { User } from '../../services/users/users.interfaces';

describe('LoginPageComponent', () => {
  let component: LoginPageComponent;
  let fixture: ComponentFixture<LoginPageComponent>;
  let userServiceSpy: jasmine.SpyObj<UsersService>;
  let location: Location;
  let localStorage: LocalStorageService;

  beforeEach(async () => {
    userServiceSpy = jasmine.createSpyObj('UsersService', ['isAuth', 'createUser', 'login']);

    userServiceSpy.isAuth.and.returnValue(false);

    function processCreateLogin<T extends (param: User) => void>(
      user: Partial<User>,
      callback: T | undefined,
    ) {
      const toReturn = { ...fakeUser, id: '100', login: user.login, password: user.password };

      callback && callback(toReturn);

      return toReturn;
    }

    userServiceSpy.createUser.and.callFake((user, callback) => {
      const toReturn = processCreateLogin(user, callback);

      return of(toReturn);
    });

    userServiceSpy.login.and.callFake((user, callback) => {
      const toReturn = processCreateLogin(user, callback);

      return of([toReturn]);
    });

    await TestBed.configureTestingModule({
      imports: [LoginPageComponent],
      providers: [
        { provide: LocalStorageService, useClass: FakeLocalStorage },
        { provide: UsersService, useValue: userServiceSpy },
        provideRouter([{ path: frontRoutes.base, component: LoginPageComponent }]),
        provideLocationMocks(),
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

    expect(switchToggler.textContent?.trim()).toBe('Sign in');
  });

  it('LoginPageComponent should validate the form', async () => {
    expect(component.form.valid).toBeFalse();
    expect(component.form.dirty).toBeFalse();

    const loginInput = fixture.debugElement.query(By.css('#login'))
      .nativeElement as HTMLInputElement;
    const passwordInput = fixture.debugElement.query(By.css('#password'))
      .nativeElement as HTMLInputElement;
    const submitBtn = fixture.debugElement.query(By.css('.login-btn'))
      .nativeElement as HTMLButtonElement;

    //No errors on the screen
    const errorsContainer = fixture.debugElement.query(By.directive(FormErrorsContainerComponent));
    const errorsContainerNative = errorsContainer.nativeElement as HTMLElement;

    expect(errorsContainerNative.children.length).toBe(0);

    //Show all errors
    submitBtn.dispatchEvent(new Event('click'));

    await fixture.whenStable();
    fixture.detectChanges();

    expect(errorsContainerNative.children.length).toBe(1);

    //Check errors
    function getErrorsConfig() {
      const errors = errorsContainerNative.querySelectorAll('.error-label');
      const errorMessages = Array.from(errors).map(el => el.textContent?.trim());

      return { errors, errorMessages };
    }

    let errorsConfig = getErrorsConfig();

    expect(errorsConfig.errors.length).toBe(2);
    expect(errorsConfig.errorMessages).toEqual(['Login is required.', 'Password is required.']);

    //Fix login error
    loginInput.value = 'test';
    loginInput.dispatchEvent(new Event('input'));

    fixture.detectChanges();
    errorsConfig = getErrorsConfig();

    expect(errorsConfig.errors.length).toBe(1);
    expect(errorsConfig.errorMessages).toEqual(['Password is required.']);

    //Fix all errors
    passwordInput.value = 'rest';
    passwordInput.dispatchEvent(new Event('input'));

    fixture.detectChanges();
    errorsConfig = getErrorsConfig();

    expect(errorsConfig.errors.length).toBe(0);
  });

  it('LoginPageComponent should create a new user', () => {
    const loginInput = fixture.debugElement.query(By.css('#login'))
      .nativeElement as HTMLInputElement;
    const passwordInput = fixture.debugElement.query(By.css('#password'))
      .nativeElement as HTMLInputElement;
    const submitBtn = fixture.debugElement.query(By.css('.login-btn'))
      .nativeElement as HTMLButtonElement;

    loginInput.value = 'test';
    passwordInput.value = 'rest';

    loginInput.dispatchEvent(new Event('input'));
    passwordInput.dispatchEvent(new Event('input'));

    fixture.detectChanges();

    submitBtn.dispatchEvent(new Event('click'));

    fixture.detectChanges();

    expect(userServiceSpy.login).toHaveBeenCalled();

    const user = localStorage.getItem('user') as User;

    expect(user.id).toBe('100');
    expect(location.path()).toBe('');
  });

  it('LoginPageComponent should switch auth mode and create a user', () => {
    component.switchMode();
    fixture.detectChanges();

    const modeSwitcher = fixture.debugElement.query(By.css('.mode-switcher'))
      .nativeElement as HTMLElement;

    expect(modeSwitcher.textContent?.trim()).toBe('Sign up');

    //Create a new user
    const loginInput = fixture.debugElement.query(By.css('#login'))
      .nativeElement as HTMLInputElement;
    const passwordInput = fixture.debugElement.query(By.css('#password'))
      .nativeElement as HTMLInputElement;
    const submitBtn = fixture.debugElement.query(By.css('.login-btn'))
      .nativeElement as HTMLButtonElement;

    loginInput.value = 'create';
    passwordInput.value = 'create';

    loginInput.dispatchEvent(new Event('input'));
    passwordInput.dispatchEvent(new Event('input'));

    fixture.detectChanges();

    submitBtn.dispatchEvent(new Event('click'));

    fixture.detectChanges();

    const user = localStorage.getItem('user') as User;

    expect(userServiceSpy.createUser).toHaveBeenCalled();
    expect({ password: user.password, login: user.login }).toEqual({
      password: 'create',
      login: 'create',
    });
  });
});
