import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChooseFirstHeroComponent } from './choose-first-hero.component';

describe('ChooseFirstHeroComponent', () => {
  let component: ChooseFirstHeroComponent;
  let fixture: ComponentFixture<ChooseFirstHeroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChooseFirstHeroComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ChooseFirstHeroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
