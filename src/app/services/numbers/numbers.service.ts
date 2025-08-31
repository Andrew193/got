import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NumbersService {

  constructor() { }

  roundToStep(v: number, step = 100): number {
    return Math.round(v / step) * step;
  }
}
