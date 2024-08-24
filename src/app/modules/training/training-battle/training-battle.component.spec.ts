import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainingBattleComponent } from './training-battle.component';

describe('TrainingBattleComponent', () => {
  let component: TrainingBattleComponent;
  let fixture: ComponentFixture<TrainingBattleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrainingBattleComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TrainingBattleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
