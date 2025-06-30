import {TestBed} from '@angular/core/testing';

import {GameFieldService} from './game-field.service';

describe('GameFieldService', () => {
  let service: GameFieldService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameFieldService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
