import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainingConfigComponent } from './training-config.component';

describe('TavernaConfigComponent', () => {
  let component: TrainingConfigComponent;
  let fixture: ComponentFixture<TrainingConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrainingConfigComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TrainingConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
