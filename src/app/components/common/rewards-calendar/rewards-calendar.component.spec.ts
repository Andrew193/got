import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RewardsCalendarComponent } from './rewards-calendar.component';

describe('RewardsCalendarComponent', () => {
  let component: RewardsCalendarComponent;
  let fixture: ComponentFixture<RewardsCalendarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RewardsCalendarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RewardsCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
