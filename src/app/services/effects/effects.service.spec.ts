import {TestBed} from '@angular/core/testing';

import {eS} from './effects.service';

describe('eS', () => {
  let service: eS;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(eS);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
