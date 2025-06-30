import {ComponentFixture, TestBed} from '@angular/core/testing';

import {GameEntryPointComponent} from './game-entry-point.component';

describe('GameBoardComponent', () => {
  let component: GameEntryPointComponent;
  let fixture: ComponentFixture<GameEntryPointComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameEntryPointComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(GameEntryPointComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
