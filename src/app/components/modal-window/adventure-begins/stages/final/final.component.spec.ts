import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinalComponent } from './final.component';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { FakeMatBottomSheetRef } from '../../../../../test-related';
import { SceneContext } from '../../../../../models/interfaces/scenes/scene.interface';
import { SceneNames } from '../../../../../constants';
import { HeroesNamesCodes } from '../../../../../models/unit.model';

describe('FinalComponent', () => {
  let component: FinalComponent;
  let fixture: ComponentFixture<FinalComponent>;
  const data: SceneContext<SceneNames.firstBattle> = {
    name: HeroesNamesCodes.LadyOfDragonStone,
    repeat: false,
    reward: {
      gold: 10,
      silver: 100,
      copper: 1000,
    },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinalComponent],
      providers: [
        {
          provide: MatBottomSheetRef,
          useValue: FakeMatBottomSheetRef,
        },
        {
          provide: MAT_BOTTOM_SHEET_DATA,
          useValue: data,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FinalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
