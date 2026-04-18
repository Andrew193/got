import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { DepositService } from './deposit.service';
import { HttpClient } from '@angular/common/http';

describe('DepositService', () => {
  let service: DepositService;
  let httpClientSpy: { [K in keyof HttpClient]: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    httpClientSpy = { get: vi.fn(), post: vi.fn(), put: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        {
          provide: HttpClient,
          useValue: httpClientSpy,
        },
      ],
    });
    service = TestBed.inject(DepositService);
  });

  it('DepositService should be created', () => {
    expect(service).toBeTruthy();
  });
});
