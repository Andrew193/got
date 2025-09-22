import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class NumbersService {
  constructor() {}

  roundToStep(v: number, step = 100): number {
    return Math.round(v / step) * step;
  }

  roundDown(value: number, decimals: number): number {
    const f = Math.pow(10, decimals);
    return Math.floor(value * f) / f;
  }

  getNumberInRange(min: number, max: number) {
    return (
      Math.floor(Math.random() * (Math.floor(max) - Math.ceil(min) + 1)) +
      Math.ceil(min)
    );
  }

  getRandomInt(min: number, max: number) {
    return (
      Math.floor(Math.random() * (Math.floor(max) - Math.ceil(min) + 1)) +
      Math.ceil(min)
    );
  }
}
