import {TestBed} from '@angular/core/testing';

import {DailyRewardService} from './daily-reward.service';

describe('DailyRewardService', () => {
  let service: DailyRewardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DailyRewardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
