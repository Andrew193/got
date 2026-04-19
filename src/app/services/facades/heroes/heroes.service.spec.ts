import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { EffectsService } from '../../effects/effects.service';
import { getEffectFake, getFakeEffectMap } from '../../../test-related';
import { createDeepCopy } from '../../../helpers';
import { ALL_EFFECTS } from '../../../constants';
import { HeroesNamesCodes } from '../../../models/units-related/unit.model';
import { HeroesFacadeService } from './heroes.service';

describe('HeroesHelperService', () => {
  let service: HeroesFacadeService;
  let effectsMock: { [K in keyof EffectsService]: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    effectsMock = {
      getEffect: vi.fn(),
      effectsToHighlight: [ALL_EFFECTS.burning, ALL_EFFECTS.freezing],
      effects: createDeepCopy(ALL_EFFECTS),
      effectsDescriptions: {
        [ALL_EFFECTS.burning]: 'Наносит противнику урон в размере 10% от его здоровья каждый ход.',
        [ALL_EFFECTS.freezing]: 'Герой заморожен и может двигаться только на 1 клетку за ход.',
      },
      effectsMap: getFakeEffectMap(),
    };

    const getEffect = getEffectFake(effectsMock.effectsMap);

    effectsMock.getEffect.mockImplementation(getEffect);

    TestBed.configureTestingModule({
      providers: [HeroesFacadeService, { provide: EffectsService, useValue: effectsMock }],
    });
    service = TestBed.inject(HeroesFacadeService);
  });

  it('HeroesHelperService should be created', () => {
    expect(service).toBeTruthy();
  });

  it('HeroesHelperService returns all effects', () => {
    const allEffects = service.helper.effects;

    expect(allEffects).toEqual(
      expect.objectContaining({
        burning: 'Burning',
        freezing: 'Freezing',
        healthRestore: 'Recovery',
      }),
    );
  });

  it('HeroesHelperService returns effects to highlight', () => {
    const effectsToHighlight = service.helper.getEffectsToHighlight();

    expect(effectsToHighlight).toEqual(expect.arrayContaining(['Burning', 'Freezing']));
  });

  it('HeroesHelperService gives correct effect description', () => {
    const burningEffect = service.helper.effects.burning;
    const description = service.helper.getEffectsDescription(burningEffect);

    expect(description).toEqual(
      'Наносит противнику урон в размере 10% от его здоровья каждый ход.',
    );
  });

  it('HeroesHelperService gives correct ranks', () => {
    const firstRank = service.helper.getRank(10);
    const secondRank = service.helper.getRank(20);
    const thirdRank = service.helper.getRank(30);

    expect([firstRank, secondRank, thirdRank]).toEqual([1, 2, 3]);
  });

  it('HeroesHelperService should return a hero.', () => {
    const ladyOfDragonStone = service.getLadyOfDragonStone();

    expect(ladyOfDragonStone.name).toEqual(HeroesNamesCodes.LadyOfDragonStone);
  });

  it('HeroesHelperService should return a hero by name.', () => {
    const ldsName = service.getLadyOfDragonStone().name;
    const giantName = service.getGiant().name;

    const lds = service.getUnitByName(ldsName);
    const giant = service.getUnitByName(giantName);

    expect(giant.name).toEqual(giantName);
    expect(lds.name).toEqual(ldsName);
  });
});
