import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { inject, Injectable, Signal } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { UsersService } from '../services/users/users.service';
import { frontRoutes } from '../constants';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  NotificationsService,
  NotificationType,
} from '../services/notifications/notifications.service';

@Injectable({
  providedIn: 'root',
})
class PermissionsService {
  notificationService = inject(NotificationsService);
  notifications = toSignal(this.notificationService.$notifications) as Signal<
    Map<string, boolean>
  >;

  constructor(
    private usersService: UsersService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean> | boolean {
    return this.usersService.doesUserExist().pipe(
      map(doesUserExist => {
        return doesUserExist || this.router.createUrlTree([frontRoutes.login]);
      })
    );
  }

  canActivateGift():
    | Observable<boolean | UrlTree>
    | Promise<boolean>
    | boolean {
    const canActivate = this.notificationService.getNotification(
      NotificationType.gift_store,
      this.notifications()
    );
    return of(canActivate || this.router.createUrlTree([frontRoutes.base]));
  }
}

export const AuthGuard: CanActivateFn = ():
  | Observable<boolean | UrlTree>
  | Promise<boolean>
  | boolean => {
  return inject(PermissionsService).canActivate();
};

export const GiftGuard: CanActivateFn = ():
  | Observable<boolean | UrlTree>
  | Promise<boolean>
  | boolean => {
  return inject(PermissionsService).canActivateGift();
};
