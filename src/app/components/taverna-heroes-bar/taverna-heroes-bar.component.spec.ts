import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TavernaHeroesBarComponent } from './taverna-heroes-bar.component';

describe('TavernaHeroesBarComponent', () => {
  let component: TavernaHeroesBarComponent;
  let fixture: ComponentFixture<TavernaHeroesBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TavernaHeroesBarComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TavernaHeroesBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
