import { TestBed } from '@angular/core/testing';

import { HeroesService } from './heroes.service';
import { EffectsService } from '../effects/effects.service';
import { getEffectFake, getFakeEffectMap } from '../../test-related';
import { createDeepCopy } from '../../helpers';
import { ALL_EFFECTS } from '../../constants';

describe('HeroesService', () => {
  let service: HeroesService;
  let effectsMock: jasmine.SpyObj<EffectsService>;

  beforeEach(() => {
    effectsMock = jasmine.createSpyObj('EffectsService', ['getEffect'], {
      effectsToHighlight: ['Горение', 'Заморозка'],
      effects: createDeepCopy(ALL_EFFECTS),
      effectsDescriptions: {
        Горение: 'Наносит противнику урон в размере 10% от его здоровья каждый ход.',
        Заморозка: 'Герой заморожен и может пройти только 1 клетку за ход.',
      },
      effectsMap: getFakeEffectMap(),
    });

    const getEffect = getEffectFake(effectsMock.effectsMap);

    effectsMock.getEffect.and.callFake(getEffect);

    TestBed.configureTestingModule({
      providers: [HeroesService, { provide: EffectsService, useValue: effectsMock }],
    });
    service = TestBed.inject(HeroesService);
  });

  it('HeroesService should be created', () => {
    expect(service).toBeTruthy();
  });

  it('HeroesService returns all effects', () => {
    const allEffects = service.effects;

    expect(allEffects).toEqual(
      jasmine.objectContaining({
        burning: 'Горение',
        freezing: 'Заморозка',
        healthRestore: 'Восстановление',
      }),
    );
  });

  it('HeroesService returns effects to highlight', () => {
    const effectsToHighlight = service.getEffectsToHighlight();

    expect(effectsToHighlight).toEqual(jasmine.arrayContaining(['Горение', 'Заморозка']));
  });

  it('HeroesService gives correct effect description', () => {
    const burningEffect = service.effects.burning;
    const description = service.getEffectsDescription(burningEffect);

    expect(description).toEqual(
      'Наносит противнику урон в размере 10% от его здоровья каждый ход.',
    );
  });

  it('HeroesService gives correct ranks', () => {
    const firstRank = service.getRank(10);
    const secondRank = service.getRank(20);
    const thirdRank = service.getRank(30);

    expect([firstRank, secondRank, thirdRank]).toEqual([1, 2, 3]);
  });

  it('HeroesService finds effects in a text', () => {
    const textToCheck = 'Горение это эффект!!! Заморозка лучше.';
    const effects = service.getEffectsFromString(textToCheck);

    expect(effects.length).toEqual(2);
  });

  it('HeroesService returns a hero', () => {
    const ladyOfDragonStone = service.getLadyOfDragonStone();

    expect(ladyOfDragonStone.name).toEqual('Дейнерис Таргариен ( Леди Драконьего Камня )');
  });

  it('HeroesService returns a hero', () => {
    const ldsName = service.getLadyOfDragonStone().name;
    const giantName = service.getGiant().name;

    const lds = service.getUnitByName(ldsName);
    const giant = service.getUnitByName(giantName);

    expect(giant.name).toEqual(giantName);
    expect(lds.name).toEqual(ldsName);
  });
});
