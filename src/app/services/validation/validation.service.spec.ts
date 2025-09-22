import { TestBed } from '@angular/core/testing';

import { ValidationService } from './validation.service';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';

describe('ValidationService', () => {
  let validationService: ValidationService;
  let formGroup: FormGroup;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ValidationService],
    });

    validationService = TestBed.inject(ValidationService);
    formGroup = new FormGroup({
      testName: new FormControl('test name'),
      error: new FormControl('123456789', [Validators.maxLength(3)]),
      array: new FormArray([new FormControl('array item')]),
    });
  });

  it('ValidationService should be created', () => {
    expect(validationService).toBeTruthy();
  });

  it('ValidationService should see invalid form', () => {
    const callbackSpy = jasmine.createSpy('callback', () => {
      console.log('Called');
    });

    let invalid = validationService.isFormInvalid(formGroup, callbackSpy);
    expect(callbackSpy).toHaveBeenCalled();
    expect(invalid).toBeFalse();

    //How mark as dirty/touched
    formGroup.markAsDirty();

    invalid = validationService.isFormInvalid(formGroup, callbackSpy);
    expect(invalid).toBeTruthy();
  });

  it('ValidationService should validate form', () => {
    const valueBefore = formGroup.value;

    const nameCtrl = formGroup.get('testName') as FormControl;
    const errCtrl = formGroup.get('error') as FormControl;
    const arrayElementCtrl = (formGroup.get('array') as FormArray).controls.at(
      0
    ) as FormControl;

    const nameUvvSpy = spyOn(
      nameCtrl,
      'updateValueAndValidity'
    ).and.callThrough();
    const errUvvSpy = spyOn(
      errCtrl,
      'updateValueAndValidity'
    ).and.callThrough();
    const arrayElementCtrlSpy = spyOn(
      arrayElementCtrl,
      'updateValueAndValidity'
    ).and.callThrough();

    const result = validationService.validateAllFormFields(formGroup);

    expect(result).toBe(formGroup);

    //Worked with name
    expect(nameCtrl.dirty).toBeTrue();
    expect(nameCtrl.touched).toBeTrue();
    expect(nameUvvSpy).toHaveBeenCalledWith({ onlySelf: true });

    //Worked with error
    expect(errCtrl.dirty).toBeTrue();
    expect(errCtrl.touched).toBeTrue();
    expect(errUvvSpy).toHaveBeenCalledWith({ onlySelf: true });

    //Check recursion
    expect(arrayElementCtrl.dirty).toBeTrue();
    expect(arrayElementCtrl.touched).toBeTrue();
    expect(arrayElementCtrlSpy).toHaveBeenCalledWith({ onlySelf: true });

    //General
    expect(valueBefore).toEqual(formGroup.value);
    expect(formGroup.invalid).toBeTrue();
  });

  it('ValidationService should validate and submit form. Default', () => {
    const updateCallbackSpy = jasmine.createSpy('updateCallback');
    const createCallbackSpy = jasmine.createSpy('createCallback');

    validationService.validateFormAndSubmit(
      formGroup,
      updateCallbackSpy,
      createCallbackSpy,
      true
    );

    //The Form is invalid. Nothing happens
    expect(updateCallbackSpy).not.toHaveBeenCalled();
    expect(createCallbackSpy).not.toHaveBeenCalled();
    expect(formGroup.disabled).toBeFalse();
  });

  it('ValidationService should validate and submit form. Update', () => {
    const updateCallbackSpy = jasmine.createSpy('updateCallback');
    const createCallbackSpy = jasmine.createSpy('createCallback');

    //The form is valid. Check update
    formGroup.patchValue(
      {
        error: '12',
      },
      { emitEvent: true }
    );

    validationService.validateFormAndSubmit(
      formGroup,
      updateCallbackSpy,
      createCallbackSpy,
      true
    );

    expect(formGroup.disabled).toBeTrue();
    expect(updateCallbackSpy).toHaveBeenCalled();
  });

  it('ValidationService should validate and submit form. Create', () => {
    const updateCallbackSpy = jasmine.createSpy('updateCallback');
    const createCallbackSpy = jasmine.createSpy('createCallback');

    //The form is valid. Check update
    formGroup.patchValue(
      {
        error: '12',
      },
      { emitEvent: true }
    );

    //The form is valid. Check creation
    validationService.validateFormAndSubmit(
      formGroup,
      updateCallbackSpy,
      createCallbackSpy,
      false
    );

    expect(formGroup.disabled).toBeTrue();
    expect(createCallbackSpy).toHaveBeenCalled();
  });
});
