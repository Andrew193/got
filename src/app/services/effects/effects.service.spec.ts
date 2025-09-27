import { TestBed } from '@angular/core/testing';
import { EffectsService } from './effects.service';
import { Effect } from '../../models/effect.model';
import { ALL_EFFECTS, ALL_EFFECTS_MULTIPLIERS } from '../../constants';
import { Unit } from '../../models/unit.model';
import { HeroesService } from '../heroes/heroes.service';

describe('EffectsService', () => {
  let effectsService: EffectsService;
  let heroService: HeroesService;
  let unit: Unit;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EffectsService, HeroesService],
    });

    effectsService = TestBed.inject(EffectsService);
    heroService = TestBed.inject(HeroesService);

    unit = heroService.getLadyOfDragonStone();
  });

  it('EffectsService should be created', () => {
    expect(effectsService).toBeTruthy();
  });

  it('EffectsService should get mobility stats based on effect.', () => {
    const freeze: Effect = {
      duration: 2,
      imgSrc: '',
      m: ALL_EFFECTS_MULTIPLIERS[ALL_EFFECTS.freezing],
      type: ALL_EFFECTS.freezing,
    };
    const root: Effect = {
      duration: 2,
      imgSrc: '',
      m: ALL_EFFECTS_MULTIPLIERS[ALL_EFFECTS.root],
      type: ALL_EFFECTS.root,
    };

    let result = effectsService.getMobilityStatsBasedOnEffect(freeze, unit);

    //Freeze
    expect(result.unit.canCross).toBe(ALL_EFFECTS_MULTIPLIERS[ALL_EFFECTS.freezing]);

    //Root
    result = effectsService.getMobilityStatsBasedOnEffect(root, unit);
    expect(result.unit.canCross).toBe(ALL_EFFECTS_MULTIPLIERS[ALL_EFFECTS.root]);
  });

  it('EffectsService should return boosted parameter', () => {
    let result = effectsService.getBoostedParameterCover(unit, []);

    //No buff
    expect(result).toBe(unit.attack);

    const attackBuff: Effect = {
      duration: 0,
      imgSrc: '',
      m: ALL_EFFECTS_MULTIPLIERS[ALL_EFFECTS.attackBuff],
      type: ALL_EFFECTS.attackBuff,
    };

    result = effectsService.getBoostedParameterCover(unit, [attackBuff]);
    //With buff
    expect(result).toBe(Math.round(unit.attack * attackBuff.m));
  });

  it('EffectsService should return effects', () => {
    const result = effectsService.getEffect(ALL_EFFECTS.attackBuff, 1, 10);

    expect(result.length).toBe(10);

    const result2 = effectsService.getEffect(ALL_EFFECTS.attackBuff, 1);
    const testEffect = {
      duration: jasmine.any(Number),
      imgSrc: jasmine.any(String),
      m: ALL_EFFECTS_MULTIPLIERS[ALL_EFFECTS.attackBuff],
      type: ALL_EFFECTS.attackBuff,
    };

    expect(result2).toEqual(jasmine.objectContaining(testEffect));
  });
});
