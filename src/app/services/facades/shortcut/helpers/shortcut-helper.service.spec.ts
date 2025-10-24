import { TestBed } from '@angular/core/testing';

import { ShortcutHelperService } from './shortcut-helper.service';

describe('ShortcutHelperService', () => {
  let service: ShortcutHelperService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ShortcutHelperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
