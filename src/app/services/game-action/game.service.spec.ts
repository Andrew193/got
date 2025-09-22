import { GameService } from './game.service';
import { TestBed } from '@angular/core/testing';
import { EffectsService } from '../effects/effects.service';
import { createDeepCopy } from '../../helpers';
import { ALL_EFFECTS } from '../../constants';
import { HeroesService } from '../heroes/heroes.service';
import { Unit } from '../../models/unit.model';
import { Position } from '../../models/field.model';
import { LogRecord } from '../../models/logger.model';

describe('GameService', () => {
  let gameService: GameService;
  let effectServiceSpy: jasmine.SpyObj<EffectsService>;
  let heroesService: HeroesService;
  let testUnit: Unit;
  const realEffectService = new EffectsService();

  beforeEach(() => {
    effectServiceSpy = jasmine.createSpyObj(
      'EffectsService',
      ['getMultForEffect', 'getNumberForCommonEffects', 'getHealthAfterRestore', 'getEffect'],
      {
        effects: createDeepCopy(ALL_EFFECTS),
      },
    );

    effectServiceSpy.getMultForEffect.and.returnValue(1);
    effectServiceSpy.getNumberForCommonEffects.and.returnValue(1);
    effectServiceSpy.getHealthAfterRestore.and.callFake(health => health);
    effectServiceSpy.getEffect.and.callFake((effectType, turns, count) => {
      return realEffectService.getEffect(effectType, turns, count);
    });

    TestBed.configureTestingModule({
      providers: [
        GameService,
        HeroesService,
        { provide: EffectsService, useValue: effectServiceSpy },
      ],
    });

    gameService = TestBed.inject(GameService);
    heroesService = TestBed.inject(HeroesService);

    testUnit = heroesService.getLadyOfDragonStone();
  });

  it('GameService should be created', () => {
    expect(gameService).toBeTruthy();
  });

  it('GameService should give fixed defence', () => {
    const newDefence = gameService.getFixedDefence(testUnit.defence, testUnit);

    expect(testUnit.defence).toBe(newDefence);
  });

  it('GameService should give the position (unit can get to from path)', () => {
    const path: Position[] = [
      {
        i: 0,
        j: 0,
      },
      {
        i: 1,
        j: 0,
      },
      {
        i: 2,
        j: 0,
      },
      {
        i: 3,
        j: 0,
      },
      {
        i: 4,
        j: 0,
      },
    ];

    let canGetTo = gameService.getCanGetToPosition(testUnit, path, { i: 0, j: 0 });

    //Can cross 1 tile
    expect(canGetTo).toEqual({ i: 1, j: 0 });

    //Cannot move
    canGetTo = gameService.getCanGetToPosition({ ...testUnit, canCross: 0, maxCanCross: 0 }, path, {
      i: 0,
      j: 0,
    });
    expect(canGetTo).toEqual({ i: testUnit.x, j: testUnit.y });
  });

  it('GameService should give fixed attack', () => {
    const newAttack = gameService.getFixedAttack(testUnit.attack, testUnit);

    expect(testUnit.attack).toBe(newAttack);
  });

  it('GameService should check passive skills', () => {
    const logs: LogRecord[] = [];

    testUnit = heroesService.getLadyOfDragonStone();
    testUnit = { ...testUnit, health: 1000 };

    effectServiceSpy.getNumberForCommonEffects.and.returnValue(10);
    gameService.checkPassiveSkills([testUnit], logs);

    expect(1010).toBe(testUnit.health);
    expect(logs.length).toBe(1);

    const expected = jasmine.objectContaining({
      info: jasmine.any(Boolean),
      imgSrc: jasmine.any(String),
      message: `Игрок ${testUnit.name} восстановил 10 ед. !`,
    });

    expect(logs[0]).toEqual(expected);
  });

  it('GameService should select skills and recount cooldown', () => {
    let skills = gameService.selectSkillsAndRecountCooldown([testUnit], testUnit, false);

    //Do nothing
    expect(skills).toEqual(testUnit.skills);

    //Check recount
    testUnit.skills[1] = { ...testUnit.skills[1], remainingCooldown: testUnit.skills[1].cooldown };
    skills = gameService.selectSkillsAndRecountCooldown([testUnit], testUnit, true);

    expect(testUnit.skills[1].remainingCooldown - 1).toEqual(skills[1].remainingCooldown);
  });
});
