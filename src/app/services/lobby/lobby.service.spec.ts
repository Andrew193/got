import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { LobbyService } from './lobby.service';
import { provideStore } from '@ngrx/store';

describe('LobbyService', () => {
  let service: LobbyService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideStore()],
    });
    service = TestBed.inject(LobbyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
