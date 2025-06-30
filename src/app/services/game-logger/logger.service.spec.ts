import {TestBed} from '@angular/core/testing';

import {GameLoggerService} from './logger.service';

describe('LoggerService', () => {
  let service: GameLoggerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameLoggerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
