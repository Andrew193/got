import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DepositModalComponent } from './modal-deposit.component';
import { MatDialogRef } from '@angular/material/dialog';
import { FakeMatDialogRef } from '../../../test-related';
import { HttpClient } from '@angular/common/http';
import { DYNAMIC_COMPONENT_DATA } from '../../../models/tokens';
import { DepositConfig } from '../../../models/iron-bank.model';
import { provideMockStore } from '@ngrx/store/testing';
import { HeroProgressInitialState } from '../../../store/reducers/hero-progress.reducer';
import { StoreNames } from '../../../store/store.interfaces';

describe('DepositModalComponent', () => {
  let component: DepositModalComponent;
  let fixture: ComponentFixture<DepositModalComponent>;
  let httpClientSpy: { [K in keyof HttpClient]: ReturnType<typeof vi.fn> };
  const data: DepositConfig = {
    currency: {
      gold: 10,
      silver: 100,
      copper: 1000,
    },
    days: 0,
  };

  beforeEach(async () => {
    httpClientSpy = { get: vi.fn(), post: vi.fn(), put: vi.fn() };

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
        provideMockStore({
          initialState: { [StoreNames.heroProgress]: HeroProgressInitialState },
        }),
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
