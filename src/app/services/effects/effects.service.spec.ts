import { TestBed } from '@angular/core/testing';
import { EffectsService } from './effects.service';

describe('EffectsService', () => {
  let effectsService: EffectsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EffectsService],
    });
  });

  it('should be created', () => {
    expect(true).toBeTruthy();
  });
});
