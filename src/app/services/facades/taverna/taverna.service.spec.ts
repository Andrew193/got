import { TestBed } from '@angular/core/testing';

import { TavernaService } from './taverna.service';

describe('TavernaService', () => {
  let service: TavernaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TavernaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
