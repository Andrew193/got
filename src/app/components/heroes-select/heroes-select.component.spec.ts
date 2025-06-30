import {ComponentFixture, TestBed} from '@angular/core/testing';

import {HeroesSelectComponent} from './heroes-select.component';

describe('HeroesSelectComponent', () => {
  let component: HeroesSelectComponent;
  let fixture: ComponentFixture<HeroesSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeroesSelectComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(HeroesSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
