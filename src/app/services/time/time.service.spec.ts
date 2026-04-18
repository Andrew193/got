import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { TimeService } from './time.service';

describe('TimeService', () => {
  let timeService: TimeService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TimeService],
    });

    timeService = TestBed.inject(TimeService);
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('TimeService should be created', () => {
    expect(timeService).toBeTruthy();
  });

  it('TimeService should convert seconds to hours', () => {
    const tenHoursInSeconds = 36000;

    const tenHours = timeService.convertToHours(tenHoursInSeconds);
    const fiveHours = timeService.convertToHours(tenHoursInSeconds / 2);

    expect(tenHours).toBe(10);
    expect(fiveHours).toBe(5);
  });

  it('TimeService should give difference', () => {
    vi.useFakeTimers();

    const now = new Date(Date.UTC(2024, 0, 1, 0, 0, 0));

    vi.setSystemTime(now);

    const createdAt = Date.now();
    let diff = timeService.getTotalPlaytime(createdAt);

    //No difference
    expect([diff.diffInDays, diff.diffInHours, diff.diffInMinutes]).toEqual([0, 0, 0]);

    //Tick time 1 hour
    vi.advanceTimersByTime(60 * 60 * 1000);

    diff = timeService.getTotalPlaytime(createdAt);
    expect([diff.diffInHours, diff.diffInMinutes]).toEqual([1, 60]);

    //Tick time 1 day
    vi.advanceTimersByTime(60 * 60 * 1000 * 23);

    diff = timeService.getTotalPlaytime(createdAt);
    expect(diff.diffInDays).toBe(1);

    vi.useRealTimers();
  });
});
