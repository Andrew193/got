/**
 * Preservation Tests — Task 2
 *
 * Property 2: Preservation — No unlockHero in Login Flow
 *
 * Validates: Requirements 3.1, 3.2
 *
 * For the login flow (createUser = false), unlockHero is never called.
 * When createUser = false, submitInnerFunction calls usersService.login()
 * and heroProgressService.unlockHero is never invoked.
 *
 * These tests PASS on UNFIXED code — they capture baseline behavior to preserve.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { LoginPageComponent } from './login-page.component';
import { UsersService } from '../../services/users/users.service';
import { LocalStorageService } from '../../services/localStorage/local-storage.service';
import { ValidationService } from '../../services/validation/validation.service';
import { NavigationService } from '../../services/facades/navigation/navigation.service';
import { LoginFacadeService } from '../../services/facades/login/login.service';
import { HeroProgressService } from '../../services/facades/hero-progress/hero-progress.service';
import { APP_INIT_STEPS } from '../../injection-tokens';
import { User } from '../../services/users/users.interfaces';

// ---------------------------------------------------------------------------
// Test B — No unlockHero in login flow (createUser = false)
// ---------------------------------------------------------------------------

describe('LoginPageComponent — Preservation: No unlockHero in login flow (Task 2)', () => {
  let loginSpy: ReturnType<typeof vi.fn>;
  let unlockHeroSpy: ReturnType<typeof vi.fn>;

  const mockUser: User = {
    id: 'user-123',
    login: 'testuser',
    password: 'testpass',
    currency: { gold: 0, silver: 0, copper: 0 },
    online: { onlineTime: 0, claimedRewards: [], lastLoyaltyBonus: '' },
  } as unknown as User;

  beforeEach(async () => {
    unlockHeroSpy = vi.fn().mockReturnValue(of({}));

    // login() calls the callback with the user immediately
    loginSpy = vi.fn().mockImplementation((_credentials: unknown, callback: (u: User) => void) => {
      callback(mockUser);

      return of([mockUser]);
    });

    await TestBed.configureTestingModule({
      imports: [LoginPageComponent, ReactiveFormsModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: APP_INIT_STEPS, useValue: [] },
        {
          provide: UsersService,
          useValue: {
            login: loginSpy,
            createUser: vi.fn().mockReturnValue(of(mockUser)),
            isAuth: vi.fn().mockReturnValue(false),
          },
        },
        {
          provide: LocalStorageService,
          useValue: {
            getItem: vi.fn().mockReturnValue(null),
            setItem: vi.fn(),
            getUserId: vi.fn().mockReturnValue('user-123'),
          },
        },
        ValidationService,
        {
          provide: NavigationService,
          useValue: { goToMainPage: vi.fn(), goToLogin: vi.fn() },
        },
        {
          provide: LoginFacadeService,
          useValue: {
            openAdventureBegins: vi.fn(),
            closeAdventureBeginsDialog: vi.fn(),
          },
        },
        {
          provide: HeroProgressService,
          useValue: { unlockHero: unlockHeroSpy },
        },
        {
          provide: MatSnackBar,
          useValue: { open: vi.fn() },
        },
        {
          provide: Router,
          useValue: { navigate: vi.fn(), navigateByUrl: vi.fn() },
        },
      ],
    }).compileComponents();
  });

  /**
   * When createUser = false (existing-user login), submitInnerFunction calls
   * usersService.login() and heroProgressService.unlockHero is NEVER invoked.
   *
   * This test PASSES on UNFIXED code — confirming the login path is clean.
   */
  it('should never call unlockHero when createUser = false (login flow)', async () => {
    const fixture = TestBed.createComponent(LoginPageComponent);
    const component = fixture.componentInstance;

    fixture.detectChanges();

    // Ensure we are in login mode (createUser = false is the default)
    expect(component.createUser).toBe(false);

    // Fill in valid form values so validation passes
    component.form.setValue({ login: 'testuser', password: 'testpass' });

    // Call submitInnerFunction directly — this is the path taken when createUser = false
    component.submitInnerFunction();

    // Give any microtasks / setTimeout(1000) a chance to run
    await new Promise(resolve => setTimeout(resolve, 1100));

    // unlockHero must never have been called
    expect(unlockHeroSpy).not.toHaveBeenCalled();
  });

  /**
   * Additional check: usersService.login() IS called when createUser = false.
   * This confirms the login path is exercised (not silently skipped).
   */
  it('should call usersService.login() when createUser = false', async () => {
    const fixture = TestBed.createComponent(LoginPageComponent);
    const component = fixture.componentInstance;

    fixture.detectChanges();

    component.form.setValue({ login: 'testuser', password: 'testpass' });
    component.submitInnerFunction();

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(loginSpy).toHaveBeenCalled();
  });
});
