import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FirstBattleComponent } from './first-battle.component';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { FakeMatBottomSheetRef } from '../../../../../test-related';
import { SceneContext } from '../../../../../models/interfaces/scenes/scene.interface';
import { SceneNames } from '../../../../../constants';
import { HeroesNamesCodes } from '../../../../../models/unit.model';

describe('FirstBattleComponent', () => {
  let component: FirstBattleComponent;
  let fixture: ComponentFixture<FirstBattleComponent>;
  const data: SceneContext<SceneNames.firstHero> = {
    name: HeroesNamesCodes.LadyOfDragonStone,
    repeat: false,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FirstBattleComponent],
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

    fixture = TestBed.createComponent(FirstBattleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
