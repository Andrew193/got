import { TestBed } from '@angular/core/testing';
import { GameLoggerService } from './logger.service';
import { LogConfig } from '../../../models/logger.model';
import { Skill } from '../../../models/units-related/skill.model';
import { HeroesService } from '../../facades/heroes/heroes.service';
import { TileUnit } from '../../../models/field.model';

describe('GameLoggerService', () => {
  let gameLoggerService: GameLoggerService;
  let heroesService: HeroesService;

  const skill: Skill = {
    cooldown: 2,
    description: 'Test description',
    dmgM: 10,
    imgSrc: '//',
    name: 'Test skill',
    remainingCooldown: 2,
  };
  const emptyLogConfig: LogConfig = {
    damage: null,
    newHealth: null,
    battleMode: false,
  };
  let testUnit: TileUnit;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GameLoggerService, HeroesService],
    });

    gameLoggerService = TestBed.inject(GameLoggerService);
    heroesService = TestBed.inject(HeroesService);

    testUnit = heroesService.getTileUnit(heroesService.getBrownWolf());
  });

  it('GameLoggerService should be created', () => {
    expect(gameLoggerService).toBeTruthy();
  });

  it('GameLoggerService should return empty config', () => {
    const result = gameLoggerService.logEvent(emptyLogConfig, false, skill, testUnit);

    expect(result).toEqual({ message: '', isUser: false, imgSrc: '' });
  });

  it('GameLoggerService should return const message', () => {
    const message = 'Const message';
    const result = gameLoggerService.logEvent(
      { ...emptyLogConfig, battleMode: true },
      false,
      skill,
      testUnit,
      message,
    );

    expect(result.message).toEqual(message);
  });

  it('GameLoggerService should return not battle message', () => {
    const result = gameLoggerService.logEvent(emptyLogConfig, false, skill, testUnit, 'Test');

    expect(result.message).toContain('has been opened/collected!');
  });

  it('GameLoggerService should return additional DMG', () => {
    const result = gameLoggerService.logEvent(
      { ...emptyLogConfig, addDmg: 100, battleMode: true },
      true,
      skill,
      testUnit,
    );

    expect(result.message).toBe(
      `Player ${testUnit.name} received 100. ! additional DMG from debuff undefined`,
    );
  });

  it('GameLoggerService should return damage message', () => {
    const result = gameLoggerService.logEvent(
      { ...emptyLogConfig, damage: 100, battleMode: true },
      false,
      skill,
      testUnit,
    );

    expect(result.message).toBe(
      `Bot ${testUnit.name} (${testUnit.x + 1})(${testUnit.y + 1}) received 100. DMG!`,
    );
  });

  it('GameLoggerService should log defeat', () => {
    const result = gameLoggerService.logEvent(
      { ...emptyLogConfig, newHealth: 0, battleMode: true },
      false,
      skill,
      testUnit,
    );

    expect(result.message).toBe(
      `Bot ${testUnit.name} (${testUnit.x + 1})(${testUnit.y + 1}) went to the seven!`,
    );
  });
});
