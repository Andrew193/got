import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FormErrorsContainerComponent} from './form-errors-container.component';

describe('FormErrorsContainerComponent', () => {
  let component: FormErrorsContainerComponent;
  let fixture: ComponentFixture<FormErrorsContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormErrorsContainerComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(FormErrorsContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
