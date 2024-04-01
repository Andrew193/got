import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BasicGameBoardComponent } from './basic-game-board.component';

describe('BasicGameBoardComponent', () => {
  let component: BasicGameBoardComponent;
  let fixture: ComponentFixture<BasicGameBoardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BasicGameBoardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BasicGameBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
