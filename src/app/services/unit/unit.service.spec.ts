import { TestBed } from '@angular/core/testing';
import { UnitService } from './unit.service';
import { Unit } from '../../models/unit.model';
import { EffectsService } from '../effects/effects.service';
import { DomSanitizer } from '@angular/platform-browser';
import { HeroesService } from '../heroes/heroes.service';
import { Skill } from '../../models/skill.model';
import { Coordinate, Position, Tile } from '../../models/field.model';

describe('UnitService', () => {
  let unitService: UnitService;
  let heroService: HeroesService;
  let effectsService: EffectsService;
  let units: Unit[];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UnitService, EffectsService, DomSanitizer, HeroesService],
    });

    unitService = TestBed.inject(UnitService);
    heroService = TestBed.inject(HeroesService);
    effectsService = TestBed.inject(EffectsService);

    units = [
      { ...heroService.getGiant(), x: 1, y: 1 },
      {
        ...heroService.getLadyOfDragonStone(),
        x: 0,
        y: 0,
      },
      { ...heroService.getBrownWolf(), x: 2, y: 4 },
    ];
  });

  it('UnitService should be created', () => {
    expect(unitService).toBeTruthy();
  });

  it('UnitService should find unit index', () => {
    let foundUnit = unitService.findUnitIndex(units, { x: 0, y: 0 });

    //DT(LDS)
    expect(foundUnit).toBe(1);

    foundUnit = unitService.findUnitIndex(units, { x: 1, y: 1 });

    //Giant
    expect(foundUnit).toBe(0);
  });

  it('UnitService should recount skill cooldown', () => {
    const skills: Skill[] = [
      {
        imgSrc: 'no',
        dmgM: 10,
        cooldown: 3,
        remainingCooldown: 3,
        name: 'hit',
        description: 'hit hard',
      },
    ];

    const recountedSkills = unitService.recountSkillsCooldown(skills);

    //Updates remainingCooldown, but does not change anything
    expect(recountedSkills[0].remainingCooldown).toBe(2);
    expect([{ ...recountedSkills[0], remainingCooldown: 3 }]).toEqual(skills);
  });

  it('UnitService should return skill index', () => {
    const skills: Skill[] = [
      {
        imgSrc: 'no',
        dmgM: 10,
        cooldown: 3,
        remainingCooldown: 3,
        name: 'hit',
        description: 'hit hard',
      },
      {
        imgSrc: 'yes',
        dmgM: 100,
        cooldown: 3,
        remainingCooldown: 0,
        name: 'hit two',
        description: 'hit really hard',
      },
    ];

    const skillsCopy = structuredClone(skills);
    const skillIndex = unitService.findSkillIndex(skills, skills[1]);

    //Finds index, but does not change anything
    expect(skillIndex).toBe(1);
    expect(skillsCopy).toEqual(skills);
  });

  it('UnitService should order units by distance', () => {
    const Points: Coordinate[] = [
      { x: 1, y: 3 },
      { x: 5, y: 3 },
      { x: 3, y: 3 },
    ];

    const orderedPoints = unitService.orderUnitsByDistance(
      { x: 0, y: 0 },
      Points
    );

    expect(orderedPoints).toEqual([
      { x: 1, y: 3 },
      { x: 3, y: 3 },
      { x: 5, y: 3 },
    ]);
  });

  it('UnitService should convert Coordinate to Position', () => {
    const coordinate: Coordinate = { x: 1, y: 3 };
    const positionFromCoordinate =
      unitService.getPositionFromCoordinate(coordinate);

    expect(positionFromCoordinate.i).toBe(coordinate.x);
    expect(positionFromCoordinate.j).toBe(coordinate.y);
  });

  it('UnitService should convert Position to Coordinate', () => {
    const position: Position = { i: 1, j: 3 };
    const coordinateFromPosition =
      unitService.getCoordinateFromPosition(position);

    expect(coordinateFromPosition.x).toBe(position.i);
    expect(coordinateFromPosition.y).toBe(position.j);
  });

  it('UnitService should add debuffs to unit', () => {
    const testSkill: Skill = {
      cooldown: 0,
      description: '',
      dmgM: 0,
      imgSrc: '',
      name: 'Test',
      remainingCooldown: 0,
      debuffs: [
        ...effectsService.getEffect(effectsService.effects.burning, 2, 3),
      ],
    };

    const getEffectsWithIgnoreFilterSpy = jasmine
      .createSpy('getEffectsWithIgnoreFilter')
      .and.callFake(effectsService.getEffectsWithIgnoreFilter);

    const updatedUnit = unitService.addEffectToUnit(
      units,
      0,
      testSkill,
      false,
      getEffectsWithIgnoreFilterSpy
    );

    expect(getEffectsWithIgnoreFilterSpy).toHaveBeenCalledWith(
      jasmine.objectContaining(units[0]),
      jasmine.objectContaining(testSkill),
      false
    );

    expect(updatedUnit.effects.length).toBe(3);
  });

  it('UnitService should add buffs to unit', () => {
    const testSkill: Skill = {
      cooldown: 0,
      description: '',
      dmgM: 0,
      imgSrc: '',
      name: 'Test',
      remainingCooldown: 0,
      buffs: [
        ...effectsService.getEffect(effectsService.effects.healthRestore, 2, 1),
      ],
    };

    let updatedUnit = unitService.addBuffToUnit(units, 0, testSkill);

    expect(updatedUnit.effects.length).toBe(1);

    testSkill.buffs = [
      ...effectsService.getEffect(effectsService.effects.defBuff, 2, 1),
    ];

    updatedUnit = unitService.addBuffToUnit([updatedUnit], 0, testSkill);
    const buffsNames = updatedUnit.effects.map(e => e.type);

    expect(buffsNames).toEqual([
      effectsService.effects.healthRestore,
      effectsService.effects.defBuff,
    ]);
  });

  it('UnitService should update units on grid', () => {
    const baseTile = {
      active: false,
      x: 0,
      y: 0,
    };

    let grid: Tile[][] = [
      [baseTile, baseTile, baseTile, baseTile],
      [baseTile, baseTile, baseTile, baseTile],
    ];

    grid = grid.map((innerArray, index) => {
      return innerArray.map((tile, position) => ({
        ...tile,
        x: index,
        y: position,
      }));
    });

    grid = unitService.updateGridUnits([units[0]], grid);

    expect(grid[1][1].entity).toEqual(units[0]);
  });
});
