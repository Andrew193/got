import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FinalComponent } from './final.component';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { FakeMatBottomSheetRef } from '../../../../../test-related';
import { HeroesNamesCodes } from '../../../../../models/units-related/unit.model';
import { provideMockStore } from '@ngrx/store/testing';
import { DisplayRewardInitialState } from '../../../../../store/reducers/display-reward.reducer';

const data = {
  name: HeroesNamesCodes.LadyOfDragonStone,
  repeat: false,
  reward: { gold: 10, silver: 100, copper: 1000 },
};

describe('FinalComponent', () => {
  let component: FinalComponent;
  let fixture: ComponentFixture<FinalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinalComponent],
      providers: [
        { provide: MatBottomSheetRef, useValue: FakeMatBottomSheetRef },
        { provide: MAT_BOTTOM_SHEET_DATA, useValue: data },
        provideMockStore({
          initialState: {
            displayReward: DisplayRewardInitialState,
          },
        }),
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(FinalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
