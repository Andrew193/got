import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DebuffsBarComponent } from './debuffs-bar.component';

describe('DebuffsBarComponent', () => {
  let component: DebuffsBarComponent;
  let fixture: ComponentFixture<DebuffsBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DebuffsBarComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DebuffsBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
