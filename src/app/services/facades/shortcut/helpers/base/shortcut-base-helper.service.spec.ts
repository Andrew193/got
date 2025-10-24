import { TestBed } from '@angular/core/testing';

import { ShortcutBaseHelperService } from './shortcut-base-helper.service';

describe('ShortcutBaseHelperService', () => {
  let service: ShortcutBaseHelperService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ShortcutBaseHelperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
