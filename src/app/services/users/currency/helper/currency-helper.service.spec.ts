import { TestBed } from '@angular/core/testing';

import { CurrencyHelperService } from './currency-helper.service';

describe('CurrencyHelperService', () => {
  let service: CurrencyHelperService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CurrencyHelperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
