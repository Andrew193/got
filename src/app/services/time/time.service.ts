import { Injectable } from '@angular/core';
import moment from 'moment';

@Injectable({
  providedIn: 'root',
})
export class TimeService {
  constructor() {}

  convertToHours(time: number) {
    return Math.floor(time / 3600);
  }

  getTotalPlaytime(createdAt: number) {
    const createdMoment = moment(createdAt);

    const now = moment();
    const diffInDays = now.diff(createdMoment, 'days');
    const diffInHours = now.diff(createdMoment, 'hours');
    const diffInMinutes = now.diff(createdMoment, 'minutes');

    // console.log("Created at:", createdMoment.format("YYYY-MM-DD HH:mm:ss"));
    // console.log("Now:", now.format("YYYY-MM-DD HH:mm:ss"));
    // console.log("Difference:", diffInDays, "days,", diffInHours, "hours,", diffInMinutes, "minutes");

    return {
      diffInDays,
      diffInHours,
      diffInMinutes,
    };
  }
}
