import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GameService } from './game.service';
import { TestBed } from '@angular/core/testing';
import { EffectsService } from '../../effects/effects.service';
import { createDeepCopy } from '../../../helpers';
import { ALL_EFFECTS } from '../../../constants';
import { HeroesFacadeService } from '../../facades/heroes/heroes.service';
import { Position, TileUnit } from '../../../models/field.model';
import { ModalWindowService } from '../../modal/modal-window.service';
import { getEffectFake, getFakeEffectMap } from '../../../test-related';
import { provideStore } from '@ngrx/store';

describe('GameService', () => {
  let gameService: GameService;
  let effectServiceSpy: { [K in keyof EffectsService]: ReturnType<typeof vi.fn> };
  let heroesService: HeroesFacadeService;
  let testUnit: TileUnit;
  let modalWindowServiceSpy: { [K in keyof ModalWindowService]: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    modalWindowServiceSpy = { getModalConfig: vi.fn(), openModal: vi.fn() };
    modalWindowServiceSpy.getModalConfig.mockImplementation(
      (headerClass = '', headerMessage = '', closeBtnLabel = '', config) => {
        return {
          headerClass,
          headerMessage,
          closeBtnLabel,
          config,
        };
      },
    );

    effectServiceSpy = {
      getMultForEffect: vi.fn(),
      getNumberForCommonEffects: vi.fn(),
      getHealthAfterRestore: vi.fn(),
      getEffect: vi.fn(),
      recountStatsBasedOnEffect: vi.fn(),
      getDebuffDmg: vi.fn(),
      getHealthAfterDmg: vi.fn(),
      effects: createDeepCopy(ALL_EFFECTS),
      effectsMap: getFakeEffectMap(),
    };

    effectServiceSpy.getHealthAfterDmg.mockImplementation((health, dmg) => {
      return Math.round(Math.max(health - dmg, 0));
    });
    effectServiceSpy.getDebuffDmg.mockReturnValue(10);
    effectServiceSpy.getMultForEffect.mockReturnValue(1);
    effectServiceSpy.recountStatsBasedOnEffect.mockImplementation((effect, unit) => {
      return { unit, message: 'test' };
    });
    effectServiceSpy.getNumberForCommonEffects.mockReturnValue(1);
    effectServiceSpy.getHealthAfterRestore.mockImplementation(health => health);

    const getEffect = getEffectFake(effectServiceSpy.effectsMap);

    effectServiceSpy.getEffect.mockImplementation(getEffect);

    TestBed.configureTestingModule({
      providers: [
        GameService,
        HeroesFacadeService,
        { provide: EffectsService, useValue: effectServiceSpy },
        { provide: ModalWindowService, useValue: modalWindowServiceSpy },
        provideStore(),
      ],
    });

    gameService = TestBed.inject(GameService);
    heroesService = TestBed.inject(HeroesFacadeService);

    testUnit = heroesService.getTileUnit(heroesService.getLadyOfDragonStone());
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
    testUnit = heroesService.getTileUnit(heroesService.getLadyOfDragonStone());
    testUnit = { ...testUnit, health: 1000 };

    effectServiceSpy.getNumberForCommonEffects.mockReturnValue(10);

    const units = [testUnit];

    gameService.checkPassiveSkills(units);

    expect(units[0].health).toBe(1010);
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
    const callbackSpy = vi.fn();
    const rewardSetterSpy = { emit: vi.fn() } as any;

    gameService.checkCloseFight([testUnit], [testUnit], callbackSpy, rewardSetterSpy);

    //Nothing happens
    expect(rewardSetterSpy.emit).not.toHaveBeenCalled();

    //User looses
    gameService.checkCloseFight(
      [{ ...testUnit, health: 0 }],
      [testUnit],
      callbackSpy,
      rewardSetterSpy,
    );
    expect(rewardSetterSpy.emit).toHaveBeenCalled();

    //AI looses
    rewardSetterSpy.emit.mockClear();
    gameService.checkCloseFight(
      [{ ...testUnit, user: true }],
      [{ ...testUnit, health: 0, user: false }],
      callbackSpy,
      rewardSetterSpy,
    );
    expect(rewardSetterSpy.emit).toHaveBeenCalled();
  });

  it('GameService should check debuffs/effects', () => {
    const result = gameService.checkEffects(testUnit, true, true);

    expect(result.unit).toBeTruthy();
  });

  it('GameService should restore health and log it', () => {
    const restoreBuff = effectServiceSpy.getEffect(effectServiceSpy.effects.healthRestore);
    const unit = createDeepCopy({ ...testUnit, health: 1000 });
    const lastHealth = unit.health;
    const skill = {
      imgSrc: 'src',
      name: 'test',
      cooldown: 0,
      remainingCooldown: 0,
      dmgM: 0,
      description: '',
    };

    const result = gameService.restoreHealthForUnit(unit, restoreBuff, skill);

    expect(result.unit.health).toBe(lastHealth + 1);
  });
});
