import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PinBadgeComponent } from './pin-badge.component';

describe('PinBadgeComponent', () => {
  let component: PinBadgeComponent;
  let fixture: ComponentFixture<PinBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PinBadgeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PinBadgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
