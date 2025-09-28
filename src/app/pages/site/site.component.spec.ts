import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { SiteComponent } from './site.component';
import { UsersService } from '../../services/users/users.service';
import { LocalStorageService } from '../../services/localStorage/local-storage.service';
import { FakeLocalStorage } from '../../test-related';
import { provideLocationMocks } from '@angular/common/testing';
import { provideRouter } from '@angular/router';
import { frontRoutes } from '../../constants';
import { LoginPageComponent } from '../login-page/login-page.component';
import { Location } from '@angular/common';
import { HeaderComponent } from '../../components/common/header/header.component';
import { By } from '@angular/platform-browser';
import { ModalWindowComponent } from '../../components/modal-window/modal-window.component';

describe('SiteComponent', () => {
  let component: SiteComponent;
  let fixture: ComponentFixture<SiteComponent>;
  let usersServiceSpy: jasmine.SpyObj<UsersService>;
  let location: Location;

  beforeEach(async () => {
    usersServiceSpy = jasmine.createSpyObj('UsersService', ['isAuth']);
    usersServiceSpy.isAuth.and.returnValue(false);

    await TestBed.configureTestingModule({
      imports: [SiteComponent],
      providers: [
        {
          provide: UsersService,
          useValue: usersServiceSpy,
        },
        {
          provide: LocalStorageService,
          useClass: FakeLocalStorage,
        },
        provideRouter([
          { path: frontRoutes.base, component: SiteComponent },
          { path: frontRoutes.login, component: LoginPageComponent },
        ]),
        provideLocationMocks(),
      ],
    }).compileComponents();

    location = TestBed.inject(Location);
    fixture = TestBed.createComponent(SiteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('SiteComponent should be created', () => {
    expect(component).toBeTruthy();
  });

  it('SiteComponent should redirect an unauthorized user', fakeAsync(() => {
    tick();
    expect(location.path()).toBe(`/${frontRoutes.login}`);
  }));

  it('SiteComponent should have both: header and modal window', () => {
    const header = fixture.debugElement.query(By.directive(HeaderComponent));
    const modalWindow = fixture.debugElement.query(By.directive(ModalWindowComponent));

    expect(header.nativeElement).toBeTruthy();
    expect(modalWindow.nativeElement).toBeTruthy();
  });
});
