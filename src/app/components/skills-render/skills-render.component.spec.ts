import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkillsRenderComponent } from './skills-render.component';

describe('SkillsRenderComponent', () => {
  let component: SkillsRenderComponent;
  let fixture: ComponentFixture<SkillsRenderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkillsRenderComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SkillsRenderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
