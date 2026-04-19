import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HeroSelectTileComponent } from './hero-select-tile.component';
import { provideMockStore } from '@ngrx/store/testing';
import { HeroesSelectNames } from '../../../../constants';
import { HeroesNamesCodes } from '../../../../models/units-related/unit.model';

describe('HeroSelectTileComponent', () => {
  let component: HeroSelectTileComponent;
  let fixture: ComponentFixture<HeroSelectTileComponent>;

  const mockUnit = {
    name: HeroesNamesCodes.BrownWolf,
    imgSrc: '',
    rarity: 0,
    heroType: 0,
    rank: 0,
    level: 0,
  } as any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeroSelectTileComponent],
      providers: [
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

    fixture = TestBed.createComponent(HeroSelectTileComponent);
    fixture.componentRef.setInput('unit', mockUnit);
    fixture.componentRef.setInput('isUser', true);
    fixture.componentRef.setInput('collectionName', HeroesSelectNames.firstBattleCollection);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
