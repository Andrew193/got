import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { SiteComponent } from './site.component';
import { UsersService } from '../../services/users/users.service';
import { LocalStorageService } from '../../services/localStorage/local-storage.service';
import { FakeLocalStorage } from '../../test-related';
import { HeaderComponent } from '../../components/common/header/header.component';
import { By } from '@angular/platform-browser';
import { ModalWindowComponent } from '../../components/modal-window/modal-window.component';
import { NavigationService } from '../../services/facades/navigation/navigation.service';

describe('SiteComponent', () => {
  let component: SiteComponent;
  let fixture: ComponentFixture<SiteComponent>;
  let usersServiceSpy: { [K in keyof UsersService]: ReturnType<typeof vi.fn> };
  let navigationServiceSpy: { [K in keyof NavigationService]: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    navigationServiceSpy = { goToLogin: vi.fn() };

    usersServiceSpy = { isAuth: vi.fn() };
    usersServiceSpy.isAuth.mockReturnValue(false);

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
        {
          provide: NavigationService,
          useValue: navigationServiceSpy,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SiteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('SiteComponent should be created', () => {
    expect(component).toBeTruthy();
  });

  it('SiteComponent should redirect an unauthorized user', fakeAsync(() => {
    tick();
    expect(navigationServiceSpy.goToLogin.calls.count()).toBe(1);
  }));

  it('SiteComponent should have both: header and modal window', () => {
    const header = fixture.debugElement.query(By.directive(HeaderComponent));
    const modalWindow = fixture.debugElement.query(By.directive(ModalWindowComponent));

    expect(header.nativeElement).toBeTruthy();
    expect(modalWindow.nativeElement).toBeTruthy();
  });
});
