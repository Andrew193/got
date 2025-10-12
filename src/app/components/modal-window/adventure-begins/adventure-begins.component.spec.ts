import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdventureBeginsComponent } from './adventure-begins.component';

describe('AdventureBeginsComponent', () => {
  let component: AdventureBeginsComponent;
  let fixture: ComponentFixture<AdventureBeginsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdventureBeginsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AdventureBeginsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
