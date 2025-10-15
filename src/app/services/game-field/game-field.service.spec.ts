import { TestBed } from '@angular/core/testing';
import { GameFieldService } from './game-field.service';
import { GameService } from '../game-action/game.service';
import { Skill } from '../../models/skill.model';
import { HeroesService } from '../heroes/heroes.service';
import { NumbersService } from '../numbers/numbers.service';
import { Position } from '../../models/field.model';

describe('GameFieldService', () => {
  let gameFieldService: GameFieldService;
  let gameActionServiceSpy: jasmine.SpyObj<GameService>;
  let heroesService: HeroesService;

  beforeEach(() => {
    gameActionServiceSpy = jasmine.createSpyObj('GameService', [
      'getFixedDefence',
      'getFixedAttack',
    ]);

    gameActionServiceSpy.getFixedDefence.and.callFake(defence => {
      return defence;
    });
    gameActionServiceSpy.getFixedAttack.and.callFake(attack => {
      return attack;
    });

    TestBed.configureTestingModule({
      providers: [
        GameFieldService,
        HeroesService,
        NumbersService,
        { provide: GameService, useValue: gameActionServiceSpy },
      ],
    });

    gameFieldService = TestBed.inject(GameFieldService);
    heroesService = TestBed.inject(HeroesService);
  });

  it('GameFieldService should be created', () => {
    expect(gameFieldService).toBeTruthy();
  });

  it('GameFieldService should return a skill', () => {
    const skills: Skill[] = [
      {
        imgSrc: '',
        dmgM: 10,
        cooldown: 0,
        remainingCooldown: 0,
        name: 'Basic',
        description: 'Basic description',
      },
      {
        imgSrc: '',
        dmgM: 100,
        cooldown: 3,
        remainingCooldown: 0,
        name: 'Super',
        description: 'Super description',
      },
    ];

    //By default, chooses from the tail.
    let chosenSkill = gameFieldService.chooseAiSkill(skills);

    expect(chosenSkill).toEqual(
      jasmine.objectContaining({
        dmgM: 100,
        name: jasmine.any(String),
        cooldown: 3,
      }),
    );

    //Now chooses from the head.
    skills[1] = { ...skills[1], remainingCooldown: 3 };
    chosenSkill = gameFieldService.chooseAiSkill(skills);

    expect(chosenSkill).toEqual(
      jasmine.objectContaining({
        dmgM: 10,
        name: jasmine.any(String),
        cooldown: 0,
      }),
    );
  });

  it('GameFieldService should return damage', () => {
    const units = {
      dmgTaker: heroesService.getTileUnit(heroesService.getBrownWolf()),
      attackDealer: heroesService.getTileUnit(heroesService.getGiant()),
    };

    units.attackDealer.attack = 10;

    let damage = gameFieldService.getDamage(units);

    expect(gameActionServiceSpy.getFixedDefence).toHaveBeenCalledWith(
      units.dmgTaker.defence,
      units.dmgTaker,
    );
    expect(gameActionServiceSpy.getFixedAttack).toHaveBeenCalledWith(10, units.attackDealer);
    expect(damage).toBeLessThanOrEqual(300);

    //Add attack
    units.attackDealer.attack = 1000;
    damage = gameFieldService.getDamage(units);
    expect(damage).toBeGreaterThanOrEqual(700);
  });

  it('GameFieldService should give shortest path', () => {
    const start: Position = { i: 0, j: 0 };
    const end: Position = { i: 5, j: 5 };

    const grid: number[][] = [];

    for (let i = 0; i < 5; i++) {
      const temp = new Array(5).fill(0);

      grid.push(temp);
    }

    let result = gameFieldService.getShortestPathCover(grid, start, end, true, true);

    expect(result.length).toBe(8);

    //Shorten the way
    result = gameFieldService.getShortestPathCover(grid, start, end, true, true, true);

    expect(result.length).toBe(4);
  });

  it('GameFieldService should determine af a position can be reached', () => {
    const start: Position = { i: 0, j: 0 };
    const end: Position = { i: 2, j: 3 };

    const grid: number[][] = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];

    //Should be ok
    let canReachPosition = gameFieldService.canReachPosition(grid, start, end);

    expect(canReachPosition).toBeTrue();

    //Should be not ok
    canReachPosition = gameFieldService.canReachPosition(grid, start, {
      ...end,
      i: 4,
    });

    expect(canReachPosition).toBeFalse();
  });
});
