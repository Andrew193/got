import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BaseSelectFormControlComponent } from './base-select-form-control.component';

describe('BaseSelectFormControlComponent', () => {
  let component: BaseSelectFormControlComponent;
  let fixture: ComponentFixture<BaseSelectFormControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BaseSelectFormControlComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BaseSelectFormControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
