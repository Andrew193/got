import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeroesChooseComponent } from './heroes-choose.component';

describe('HeroesChooseComponent', () => {
  let component: HeroesChooseComponent;
  let fixture: ComponentFixture<HeroesChooseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeroesChooseComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HeroesChooseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
