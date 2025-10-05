import { inject, Injectable } from '@angular/core';
import { PreloadingStrategy, Route } from '@angular/router';
import { EMPTY, filter, Observable, switchMap, take } from 'rxjs';
import { UsersService } from '../users/users.service';
import { frontRoutes } from '../../constants';

@Injectable({
  providedIn: 'root',
})
export class PreloadingStrategyService implements PreloadingStrategy {
  private userService = inject(UsersService);
  private readonly user = this.userService.$user;

  preload(route: Route, load: () => Observable<any>): Observable<any> {
    debugger;
    const mockConfig = {
      rest: [frontRoutes.taverna],
      empty: [] as string[],
    };

    const fakeCheck = () => {
      return this.user.pipe(
        filter(value => !!value),
        take(1),
      );
    };

    return fakeCheck().pipe(
      switchMap(response => {
        const key = response?.login;

        const userConfig = mockConfig[key === 'rest' ? key : 'empty'];

        return userConfig.includes(route.path || '') ? load() : EMPTY;
      }),
    );
  }
}
