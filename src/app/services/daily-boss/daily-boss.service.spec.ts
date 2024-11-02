import { TestBed } from '@angular/core/testing';

import { DailyBossService } from './daily-boss.service';

describe('DailyBossService', () => {
  let service: DailyBossService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DailyBossService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
