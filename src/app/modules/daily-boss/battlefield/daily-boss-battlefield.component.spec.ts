import {ComponentFixture, TestBed} from '@angular/core/testing';

import {DailyBossBattlefieldComponent} from './daily-boss-battlefield.component';

describe('BattlefieldComponent', () => {
  let component: DailyBossBattlefieldComponent;
  let fixture: ComponentFixture<DailyBossBattlefieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DailyBossBattlefieldComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(DailyBossBattlefieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
