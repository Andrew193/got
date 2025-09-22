import { inject, Injectable } from '@angular/core';
import { Observable, switchMap, timer } from 'rxjs';
import { UsersService } from '../users/users.service';
import { LocalStorageService } from '../localStorage/local-storage.service';
import { TIME } from './online.contrants';

export type Online = {
  time: number;
  claimed: number;
  lastLoyaltyBonus: string;
};

@Injectable({
  providedIn: 'root',
})
export class OnlineService {
  private userService = inject(UsersService);
  private localStorageService = inject(LocalStorageService);
  private tickCounter = 0;

  constructor() {}

  trackOnlineTimer() {
    //Add untracked time to online
    this.flushTimerHelper();

    //Track time for flushTimerHelper
    setInterval(() => {
      this.incrementLocalBuffer(TIME.oneMinuteSeconds);
      this.tickCounter++;

      if (this.tickCounter === 10) {
        this.ls.setItem(this.ls.names.localOnlineBuffer, '0');
        this.tickCounter = 0;
      }
    }, TIME.oneMinuteMilliseconds);

    //Add 10 minutes to online time
    timer(TIME.tenMinutesMilliseconds, TIME.tenMinutesMilliseconds)
      .pipe(
        switchMap(
          () =>
            this.userService.updateOnline(
              { time: TIME.tenMinuteSeconds },
              true
            ) as Observable<any>
        )
      )
      .subscribe();
  }

  private flushTimerHelper() {
    const stored = this.localBuffer;

    if (stored > 0) {
      this.userService.updateOnline({ time: stored });
      this.ls.setItem(this.ls.names.localOnlineBuffer, '0');
    }
  }

  private incrementLocalBuffer(seconds: number) {
    const current = this.localBuffer;
    this.ls.setItem(this.ls.names.localOnlineBuffer, String(current + seconds));
  }

  get localBuffer() {
    return Number(this.ls.getItem(this.ls.names.localOnlineBuffer) || '0');
  }

  private get ls() {
    return this.localStorageService;
  }
}
