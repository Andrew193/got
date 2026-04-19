import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ChooseFirstHeroComponent } from './choose-first-hero.component';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { FakeMatBottomSheetRef } from '../../../../../test-related';
import { provideMockStore } from '@ngrx/store/testing';

describe('ChooseFirstHeroComponent', () => {
  let component: ChooseFirstHeroComponent;
  let fixture: ComponentFixture<ChooseFirstHeroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChooseFirstHeroComponent],
      providers: [
        { provide: MatBottomSheetRef, useValue: FakeMatBottomSheetRef },
        provideMockStore({
          initialState: {
            heroesSelect: { selections: { ids: [], entities: {} } },
            unitsConfigurator: {
              units: { ids: [], entities: {} },
              unitsConfig: { ids: [], entities: {} },
              fieldConfig: { rows: 7, columns: 10 },
              unitUpdateAllowed: true,
            },
          },
        }),
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ChooseFirstHeroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('ChooseFirstHeroComponent should be created', () => {
    expect(component).toBeTruthy();
  });
});
