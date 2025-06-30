import {ComponentFixture, TestBed} from '@angular/core/testing';

import {AutocompleteMatInputComponent} from './autocomplete-mat-input.component';

describe('TextInputComponent', () => {
  let component: AutocompleteMatInputComponent;
  let fixture: ComponentFixture<AutocompleteMatInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutocompleteMatInputComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(AutocompleteMatInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
