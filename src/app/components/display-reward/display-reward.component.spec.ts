import {ComponentFixture, TestBed} from '@angular/core/testing';

import {DisplayRewardComponent} from './display-reward.component';

describe('DisplayRewardComponent', () => {
  let component: DisplayRewardComponent;
  let fixture: ComponentFixture<DisplayRewardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DisplayRewardComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(DisplayRewardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
