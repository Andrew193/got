import {ComponentFixture, TestBed} from '@angular/core/testing';

import {DailyBossLobbyComponent} from './daily-boss-lobby.component';

describe('LobbyComponent', () => {
  let component: DailyBossLobbyComponent;
  let fixture: ComponentFixture<DailyBossLobbyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DailyBossLobbyComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(DailyBossLobbyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
