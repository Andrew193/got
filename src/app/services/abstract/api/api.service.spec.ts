import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { User } from '../../users/users.interfaces';
import { FakeLocalStorage, fakeUser, TestApiService } from '../../../test-related';
import { TestBed } from '@angular/core/testing';
import { LocalStorageService } from '../../localStorage/local-storage.service';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { IdEntity } from '../../../models/common.model';
import { TIME } from '../../online/online.contrants';

describe('ApiService', () => {
  let apiService: TestApiService<User>;
  let httpClientSpy: { [K in keyof HttpClient]: ReturnType<typeof vi.fn> };

  const user = fakeUser;

  beforeEach(() => {
    httpClientSpy = { put: vi.fn(), post: vi.fn() };

    function putPost(url: string, body: IdEntity) {
      return of(body) as any;
    }

    httpClientSpy.put.mockImplementation(putPost);
    httpClientSpy.post.mockImplementation(putPost);

    TestBed.configureTestingModule({
      providers: [
        TestApiService,
        {
          provide: LocalStorageService,
          useClass: FakeLocalStorage,
        },
        {
          provide: HttpClient,
          useValue: httpClientSpy,
        },
      ],
    });

    apiService = TestBed.inject(TestApiService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('ApiService should be created', () => {
    expect(apiService).toBeTruthy();
  });

  it('ApiService should put data (and return an observable)', done => {
    vi.useFakeTimers();
    const date = new Date(Date.UTC(2025, 0, 1, 0, 0, 0));

    vi.setSystemTime(date);

    const now = Date.now();

    vi.advanceTimersByTime(TIME.oneMinuteMilliseconds);

    const partialUser: Partial<User> = { login: 'test', password: 'test' };

    //Auto subscription
    apiService.save(partialUser, {
      url: 'https://localhost:8080',
      callback: res => {
        expect(res.createdAt).toBe(now + TIME.oneMinuteMilliseconds);
        expect(httpClientSpy.post).toHaveBeenCalled();
      },
    });

    //Manual
    apiService
      .save(
        { ...partialUser, id: user.id },
        {
          url: 'https://localhost:8080',
          callback: res => {
            expect(res.createdAt).toBeUndefined();
            expect(httpClientSpy.put).toHaveBeenCalled();
            expect(res.id).toBe(user.id);
            done();
          },
        },
      )
      .subscribe();

    vi.useRealTimers();
  });
});
