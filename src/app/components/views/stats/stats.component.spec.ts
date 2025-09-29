import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatsComponent } from './stats.component';
import { HeroesService } from '../../../services/heroes/heroes.service';
import { Unit } from '../../../models/unit.model';
import { By } from '@angular/platform-browser';

describe('StatsComponent', () => {
  let component: StatsComponent;
  let fixture: ComponentFixture<StatsComponent>;
  let heroesService: HeroesService;
  let testUnit: Unit;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatsComponent],
      providers: [HeroesService],
    }).compileComponents();

    heroesService = TestBed.inject(HeroesService);
    testUnit = heroesService.getLadyOfDragonStone();

    fixture = TestBed.createComponent(StatsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('selectedHero', testUnit);

    fixture.detectChanges();
  });

  it('StatsComponent should be created', () => {
    expect(component).toBeTruthy();
  });

  it('StatsComponent should display the selected unit', () => {
    const attackSpan = fixture.debugElement.query(By.css('.attack'))
      .nativeElement as HTMLSpanElement;
    const defenceSpan = fixture.debugElement.query(By.css('.defence'))
      .nativeElement as HTMLSpanElement;
    const healthSpan = fixture.debugElement.query(By.css('.health'))
      .nativeElement as HTMLSpanElement;
    const rageSpan = fixture.debugElement.query(By.css('.rage')).nativeElement as HTMLSpanElement;
    const willpowerSpan = fixture.debugElement.query(By.css('.willpower'))
      .nativeElement as HTMLSpanElement;
    const dmgReducedBySpan = fixture.debugElement.query(By.css('.dmgReducedBy'))
      .nativeElement as HTMLSpanElement;
    const canCrossSpan = fixture.debugElement.query(By.css('.canCross'))
      .nativeElement as HTMLSpanElement;

    expect(testUnit.attack).toBe(+(attackSpan.textContent || ''));
    expect(testUnit.defence).toBe(+(defenceSpan.textContent || ''));
    expect(testUnit.health).toBe(+(healthSpan.textContent || ''));
    expect(testUnit.rage).toBe(+(rageSpan.textContent || ''));
    expect(testUnit.willpower).toBe(+(willpowerSpan.textContent || ''));
    expect(testUnit.dmgReducedBy).toBe(parseFloat(dmgReducedBySpan.textContent || '') / 100);
    expect(testUnit.canCross).toBe(+(canCrossSpan.textContent || ''));
  });
});
