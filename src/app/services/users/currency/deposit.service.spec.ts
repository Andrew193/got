import { TestBed } from '@angular/core/testing';
import { DepositService } from './deposit.service';
import { HttpClient } from '@angular/common/http';

describe('DepositService', () => {
  let service: DepositService;
  let httpClientSpy: jasmine.SpyObj<HttpClient>;

  beforeEach(() => {
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['get', 'post', 'put']);

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
