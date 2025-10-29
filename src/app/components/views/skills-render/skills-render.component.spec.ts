import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SkillsRenderComponent } from './skills-render.component';
import { HeroesFacadeService } from '../../../services/facades/heroes/heroes.service';
import { TileUnit } from '../../../models/field.model';
import { By } from '@angular/platform-browser';
import { ImageComponent } from '../image/image.component';
import { EffectsHighlighterComponent } from '../../common/effects-highlighter/effects-highlighter.component';

describe('SkillsRenderComponent', () => {
  let component: SkillsRenderComponent;
  let fixture: ComponentFixture<SkillsRenderComponent>;
  let herosService: HeroesFacadeService;
  let testUnit: TileUnit;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkillsRenderComponent],
      providers: [HeroesFacadeService],
    }).compileComponents();

    herosService = TestBed.inject(HeroesFacadeService);
    testUnit = herosService.getTileUnit(herosService.getLadyOfDragonStone());

    fixture = TestBed.createComponent(SkillsRenderComponent);
    fixture.componentRef.setInput('selectedHero', testUnit);

    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('SkillsRenderComponent should be created', () => {
    expect(component).toBeTruthy();
  });

  it('SkillsRenderComponent should render all skills', () => {
    const skillsContainers = fixture.debugElement.queryAll(By.css('.skill-container'));

    expect(skillsContainers.length).toBe(testUnit.skills.length);
  });

  it('SkillsRenderComponent should render correct skills', () => {
    const skillsContainers = fixture.debugElement.queryAll(By.css('.skill-container'));
    const skillsImages = skillsContainers.map(el => el.query(By.directive(ImageComponent)));
    const skillsDescriptions = skillsContainers.map(el =>
      el.query(By.directive(EffectsHighlighterComponent)),
    );

    const renderedSkillsNames = skillsImages
      .map(el => el.componentInstance as ImageComponent)
      .map(el => el.alt());
    const renderedSkillsDescription = skillsDescriptions
      .map(el => el.componentInstance as EffectsHighlighterComponent)
      .map(el => el.text());

    expect(testUnit.skills.map(el => el.name)).toEqual(renderedSkillsNames);
    expect(testUnit.skills.map(el => el.description)).toEqual(renderedSkillsDescription);
  });
});
