import {ComponentFixture, TestBed} from '@angular/core/testing';

import {DailyBossEntryComponent} from './daily-boss-entry.component';

describe('DailyBossEntryComponent', () => {
  let component: DailyBossEntryComponent;
  let fixture: ComponentFixture<DailyBossEntryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DailyBossEntryComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(DailyBossEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
