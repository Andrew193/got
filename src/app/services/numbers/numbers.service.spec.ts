import {NumbersService} from "./numbers.service";
import {TestBed} from "@angular/core/testing";

describe('NumbersService', () => {
  let numbersService: NumbersService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        NumbersService
      ]
    })

    numbersService = TestBed.inject(NumbersService);
  })


  it('NumbersService should be created', () => {
    expect(numbersService).toBeTruthy();
  });

  it('NumbersService should round to step', () => {
    const numbers = [13.545, 67.499, 0.45, 0.5];
    let results: number[] = [];

    //Expected results
    const mustBe1 = [14, 67, 0, 1];
    const mustBe2 = [10, 70, 0, 0];
    const mustBe3 = [0, 100, 0, 0];

    numbers.forEach((number) => {
      results.push(numbersService.roundToStep(number, 1))
    })

    //Check with a step: 1
    expect(results).toEqual(mustBe1);
    results = [];

    //Check with a step: 10
    numbers.forEach((number) => {
      results.push(numbersService.roundToStep(number, 10))
    })
    expect(results).toEqual(mustBe2);
    results = [];

    //Check with a step: 100
    numbers.forEach((number) => {
      results.push(numbersService.roundToStep(number, 100))
    })
    expect(results).toEqual(mustBe3);
  })

  it('NumbersService should round down', () => {
    const numbers = [13.545, 67.499, 0.45, 0.5];
    let result: number[] = [];

    //Expected
    const mustBe1 = [13, 67, 0, 0];
    const mustBe2 = [13.5, 67.4, 0.4, 0.5];
    const mustBe3 = [13.54, 67.49, 0.45, 0.5];

    //Round to 0 decimals: 1, 10, 100
    numbers.forEach((number) => {
      result.push(numbersService.roundDown(number, 0));
    })

    expect(result).toEqual(mustBe1);
    result = [];

    //Round to 1 decimal: 1.1, 10.1, 100.1
    numbers.forEach((number) => {
      result.push(numbersService.roundDown(number, 1));
    })

    expect(result).toEqual(mustBe2);
    result = [];

    //Round to 2 decimals: 1.11, 10.11, 100.11
    numbers.forEach((number) => {
      result.push(numbersService.roundDown(number, 2));
    })

    expect(result).toEqual(mustBe3);
  })

  it('NumbersService should return a number in range', () => {
    let number = numbersService.getNumberInRange(1, 1);

    //1
    expect(number).toBe(1);

    //Range 1 - 10 ( *10 )

    for (let i = 0; i < 10; i++) {
      const index = i || 1;
      number = numbersService.getNumberInRange(10 * index, 100 * index);
      expect(number).toBeLessThanOrEqual(100 * index);
      expect(number).toBeGreaterThanOrEqual(10 * index);
    }
  })
})
