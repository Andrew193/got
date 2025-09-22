import { TimeService } from './time.service';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';

describe('TimeService', () => {
  let timeService: TimeService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TimeService],
    });

    timeService = TestBed.inject(TimeService);
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
    jasmine.clock().install();

    let now = new Date(Date.UTC(2024, 0, 1, 0, 0, 0));

    jasmine.clock().mockDate(now);

    const createdAt = Date.now();
    let diff = timeService.getTotalPlaytime(createdAt);

    //No difference
    expect([diff.diffInDays, diff.diffInHours, diff.diffInMinutes]).toEqual([
      0, 0, 0,
    ]);

    //Tick time 1 hour
    jasmine.clock().tick(60 * 60 * 1000);

    diff = timeService.getTotalPlaytime(createdAt);
    expect([diff.diffInHours, diff.diffInMinutes]).toEqual([1, 60]);

    //Tick time 1 day
    jasmine.clock().tick(60 * 60 * 1000 * 23);

    diff = timeService.getTotalPlaytime(createdAt);
    expect(diff.diffInDays).toBe(1);

    jasmine.clock().uninstall();
  });
});
