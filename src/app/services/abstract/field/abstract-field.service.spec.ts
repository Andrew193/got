import { TestBed } from '@angular/core/testing';

import { AbstractFieldService } from './abstract-field.service';

describe('AbstractFieldService', () => {
  let service: AbstractFieldService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AbstractFieldService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
