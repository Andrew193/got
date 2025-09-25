import { GameService } from './game.service';
import { TestBed } from '@angular/core/testing';
import { EffectsService } from '../effects/effects.service';
import { createDeepCopy } from '../../helpers';
import { ALL_EFFECTS } from '../../constants';
import { HeroesService } from '../heroes/heroes.service';
import { Unit } from '../../models/unit.model';
import { Position } from '../../models/field.model';
import { LogRecord } from '../../models/logger.model';
import { ModalWindowService } from '../modal/modal-window.service';
import { getEffectFake, getFakeEffectMap } from '../../test-related';

describe('GameService', () => {
  let gameService: GameService;
  let effectServiceSpy: jasmine.SpyObj<EffectsService>;
  let heroesService: HeroesService;
  let testUnit: Unit;
  let modalWindowServiceSpy: jasmine.SpyObj<ModalWindowService>;

  beforeEach(() => {
    modalWindowServiceSpy = jasmine.createSpyObj('ModalWindowService', [
      'getModalConfig',
      'openModal',
    ]);
    modalWindowServiceSpy.getModalConfig.and.callFake(
      (headerClass = '', headerMessage = '', closeBtnLabel = '', config) => {
        return {
          headerClass,
          headerMessage,
          closeBtnLabel,
          config,
        };
      },
    );

    effectServiceSpy = jasmine.createSpyObj(
      'EffectsService',
      [
        'getMultForEffect',
        'getNumberForCommonEffects',
        'getHealthAfterRestore',
        'getEffect',
        'recountStatsBasedOnEffect',
        'getDebuffDmg',
        'getHealthAfterDmg',
      ],
      {
        effects: createDeepCopy(ALL_EFFECTS),
        effectsMap: getFakeEffectMap(),
      },
    );

    effectServiceSpy.getHealthAfterDmg.and.callFake((health, dmg) => {
      return Math.round(Math.max(health - dmg, 0));
    });
    effectServiceSpy.getDebuffDmg.and.returnValue(10);
    effectServiceSpy.getMultForEffect.and.returnValue(1);
    effectServiceSpy.recountStatsBasedOnEffect.and.callFake((effect, unit) => {
      return { unit, message: 'test' };
    });
    effectServiceSpy.getNumberForCommonEffects.and.returnValue(1);
    effectServiceSpy.getHealthAfterRestore.and.callFake(health => health);

    const getEffect = getEffectFake(effectServiceSpy.effectsMap);

    effectServiceSpy.getEffect.and.callFake(getEffect);

    TestBed.configureTestingModule({
      providers: [
        GameService,
        HeroesService,
        { provide: EffectsService, useValue: effectServiceSpy },
        { provide: ModalWindowService, useValue: modalWindowServiceSpy },
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

  it('GameService should close a fight', () => {
    const callbackSpy = jasmine.createSpy('callback');

    gameService.checkCloseFight([testUnit], [testUnit], callbackSpy);

    //Nothing happens
    expect(callbackSpy).not.toHaveBeenCalled();
    expect(modalWindowServiceSpy.openModal).not.toHaveBeenCalled();

    //User looses
    gameService.checkCloseFight([{ ...testUnit, health: 0 }], [testUnit], callbackSpy);
    expect(modalWindowServiceSpy.openModal).toHaveBeenCalledWith({
      headerClass: 'red-b',
      headerMessage: 'Вы проиграли',
      closeBtnLabel: 'Попробовать позже',
      config: jasmine.any(Object),
    });

    //AI looses
    gameService.checkCloseFight(
      [{ ...testUnit, user: true }],
      [{ ...testUnit, health: 0, user: false }],
      callbackSpy,
    );
    expect(modalWindowServiceSpy.openModal).toHaveBeenCalledWith({
      headerClass: 'green-b',
      headerMessage: 'Вы победили',
      closeBtnLabel: 'Отлично',
      config: jasmine.any(Object),
    });
  });

  it('GameService should check debuffs/effects', () => {
    let result = gameService.checkDebuffs(testUnit, true, true, true);

    //Restore health
    expect(result.log.length).toBe(2);
    expect(result.unit.health).toBe(testUnit.health + 1);

    //Do not update health
    result = gameService.checkDebuffs(testUnit, true, true, false);
    expect(result.log.length).toBe(1);
    expect(result.unit.health).toBe(testUnit.health);

    //Get DMG from a debuff
    const poison = effectServiceSpy.getEffect(effectServiceSpy.effects.poison);

    result = gameService.checkDebuffs(
      { ...testUnit, effects: [poison], dmgReducedBy: 0 },
      true,
      true,
      false,
    );
    expect(result.unit.health).toBe(testUnit.health - 10);
  });

  it('GameService should restore health and log it', () => {
    const logs: LogRecord[] = [];
    const restoreBuff = effectServiceSpy.getEffect(effectServiceSpy.effects.healthRestore);

    const unit = createDeepCopy({ ...testUnit, health: 1000 }) as Unit;

    const lastHealth = unit.health;

    const result = gameService.restoreHealthForUnit(unit, restoreBuff, logs, { imgSrc: 'src' });

    expect(result.health).toBe(lastHealth + 1);
    expect(logs.length).toBe(1);
  });
});
