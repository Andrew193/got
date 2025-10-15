import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DepositModalComponent } from './modal-deposit.component';
import { MatDialogRef } from '@angular/material/dialog';
import { FakeMatDialogRef } from '../../../test-related';
import { HttpClient } from '@angular/common/http';
import { DYNAMIC_COMPONENT_DATA } from '../../../models/tokens';
import { DepositConfig } from '../../../models/iron-bank.model';

describe('DepositModalComponent', () => {
  let component: DepositModalComponent;
  let fixture: ComponentFixture<DepositModalComponent>;
  let httpClientSpy: jasmine.SpyObj<HttpClient>;
  const data: DepositConfig = {
    currency: {
      gold: 10,
      silver: 100,
      copper: 1000,
    },
    days: 0,
  };

  beforeEach(async () => {
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['get', 'post', 'put']);

    await TestBed.configureTestingModule({
      imports: [DepositModalComponent],
      providers: [
        {
          provide: MatDialogRef,
          useValue: FakeMatDialogRef,
        },
        {
          provide: HttpClient,
          useValue: httpClientSpy,
        },
        {
          provide: DYNAMIC_COMPONENT_DATA,
          useValue: data,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DepositModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('DepositModalComponent should be created.', () => {
    expect(component).toBeTruthy();
  });
});
