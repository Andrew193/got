import { Injectable } from '@angular/core';
import moment from 'moment';
import { DATE_FORMAT } from '../../constants';
import { TIME } from '../online/online.contrants';

@Injectable({
  providedIn: 'root',
})
export class TimeService {
  static convertToHoursOrMilliseconds(time: number, hours = true) {
    return Math.floor(hours ? time / 3600 : time * 3600);
  }

  getTotalPlaytime(createdAt: number) {
    const createdMoment = moment(createdAt);
    const now = moment();

    const toReturn = this.getDiff(createdMoment, now);

    console.log('Created at:', createdMoment.format('YYYY-MM-DD HH:mm:ss'));
    console.log('Now:', now.format('YYYY-MM-DD HH:mm:ss'));
    console.log(
      'Difference:',
      toReturn.diffInDays,
      'days,',
      toReturn.diffInHours,
      'hours,',
      toReturn.diffInMinutes,
      'minutes',
    );

    return toReturn;
  }

  format(date: number | moment.Moment) {
    return moment(date).format(DATE_FORMAT);
  }

  getDiff(date1: number | moment.Moment, date2: number | moment.Moment) {
    const date1Moment = moment(date1);
    const date2Moment = moment(date2);

    const diffInDays = date2Moment.diff(date1Moment, 'days');
    const diffInHours = date2Moment.diff(date1Moment, 'hours');
    const diffInMinutes = date2Moment.diff(date1Moment, 'minutes');

    return {
      diffInDays,
      diffInHours,
      diffInMinutes,
    };
  }

  getRemainingTime(start: number, days: number) {
    const now = Date.now();

    const target = start + days * TIME.msInDay;

    const remaining = target - now;

    if (remaining <= 0) {
      return 0;
    } else {
      const hours = Math.floor(remaining / TIME.toMsConstant);
      const minutes = Math.floor((remaining % TIME.toMsConstant) / TIME.oneMinuteMilliseconds);
      const seconds = Math.floor((remaining % TIME.oneMinuteMilliseconds) / 1000);

      console.log(`Remaining time: ${hours} ч ${minutes} мин ${seconds} сек`);

      return {
        hours,
        minutes,
        seconds,
      };
    }
  }
}
