import { AbstractFieldService } from './abstract-field.service';
import { TestBed } from '@angular/core/testing';
import { Position, TileUnit } from '../../../models/field.model';

describe('AbstractFieldService', () => {
  let service: AbstractFieldService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AbstractFieldService],
    });

    service = TestBed.inject(AbstractFieldService);
  });

  it('AbstractFieldService should be created', () => {
    expect(service).toBeTruthy();
  });

  it('AbstractFieldService should create a grid', () => {
    const field = service.getDefaultGameField();

    expect(field.length).toBe(7);
    expect(field.every(innerArray => innerArray.length === 10)).toBeTrue();
    expect(field.every(innerArray => innerArray.every(el => el.active))).toBeTrue();
  });

  it('AbstractFieldService should return grid from field', () => {
    const field = service.getDefaultGameField();
    let grid = service.getGridFromField(field);

    expect(grid.every(row => row.every(el => el === 0))).toBeTrue();

    const entity: TileUnit = {
      x: 0,
      y: 0,
      health: 0,
      inBattle: false,
      user: false,
      imgSrc: '',
      canMove: false,
      canAttack: false,
      attackRange: 0,
      canCross: 0,
      effects: [],
      heroType: 0,
      attack: 0,
      defence: 0,
      maxHealth: 0,
      name: '',
      maxCanCross: 0,
      reducedDmgFromDebuffs: [],
      dmgReducedBy: 0,
      willpower: 0,
      ignoredDebuffs: [],
      rage: 0,
      onlyHealer: false,
      skills: [],
      healer: false,
    };

    field[0][1] = { ...field[0][1], entity: entity };

    grid = service.getGridFromField(field);
    const unitsMarkers = grid.map(row => row.some(el => el === 1));

    expect(unitsMarkers).toEqual([true, false, false, false, false, false, false]);
  });

  it('AbstractFieldService should return field with units', () => {
    const userUnits: TileUnit[] = [
      {
        x: 1,
        y: 2,
        health: 10,
        inBattle: true,
        user: true,
        imgSrc: '',
        canMove: false,
        canAttack: false,
        attackRange: 0,
        canCross: 0,
        effects: [],
        heroType: 0,
        attack: 10,
        defence: 10,
        maxHealth: 10,
        name: 'User',
        maxCanCross: 0,
        reducedDmgFromDebuffs: [],
        dmgReducedBy: 0,
        willpower: 0,
        ignoredDebuffs: [],
        rage: 0,
        onlyHealer: false,
        skills: [],
        healer: false,
      },
    ];
    const aiUnits: TileUnit[] = [
      {
        x: 3,
        y: 3,
        health: 30,
        inBattle: true,
        user: false,
        imgSrc: '',
        canMove: false,
        canAttack: false,
        attackRange: 0,
        canCross: 0,
        effects: [],
        heroType: 0,
        attack: 30,
        defence: 30,
        maxHealth: 30,
        name: 'AI',
        maxCanCross: 0,
        reducedDmgFromDebuffs: [],
        dmgReducedBy: 0,
        willpower: 0,
        ignoredDebuffs: [],
        rage: 0,
        onlyHealer: false,
        skills: [],
        healer: false,
      },
    ];

    const field = service.populateGameFieldWithUnits(userUnits, aiUnits);
    const rowsWithUnits = field
      .map(row => row.filter(el => el.entity))
      .filter(row => row.length)
      .flat();

    expect(rowsWithUnits.length).toBe(2);
    expect({ x: rowsWithUnits[0].x, y: rowsWithUnits[0].y }).toEqual({
      x: field[1][2].x,
      y: field[1][2].y,
    });
    expect({ x: rowsWithUnits[1].x, y: rowsWithUnits[1].y }).toEqual({
      x: field[3][3].x,
      y: field[3][3].y,
    });
  });

  it('AbstractFieldService should find fields in radius', () => {
    const field = service.getDefaultGameField();
    const position: Position = { i: 3, j: 3 };

    let fields = service.getFieldsInRadius(field, position, 1);
    let mustBe: Position[] = [
      {
        i: 2,
        j: 3,
      },
      {
        i: 3,
        j: 2,
      },
      {
        i: 3,
        j: 4,
      },
      {
        i: 4,
        j: 3,
      },
    ];

    expect(fields.length).toBe(4);
    expect(fields).toEqual(mustBe);

    fields = service.getFieldsInRadius(field, position, 1, true);
    mustBe = [
      ...mustBe,
      {
        i: 2,
        j: 2,
      },
      {
        i: 2,
        j: 4,
      },
      {
        i: 4,
        j: 2,
      },
      {
        i: 4,
        j: 4,
      },
    ];

    expect(fields.length).toBe(8);

    const result = fields
      .map(el => !!mustBe.find(inner => inner.i === el.i && inner.j === el.j))
      .every(Boolean);

    expect(result).toBeTrue();
  });
});
