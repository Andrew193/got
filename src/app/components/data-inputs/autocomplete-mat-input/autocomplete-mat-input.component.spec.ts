import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AutocompleteMatInputComponent } from './autocomplete-mat-input.component';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { map, startWith } from 'rxjs';
import { MatFormFieldHarness } from '@angular/material/form-field/testing';
import { MatInputHarness } from '@angular/material/input/testing';
import { Component } from '@angular/core';
import { MatAutocompleteHarness } from '@angular/material/autocomplete/testing';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, AutocompleteMatInputComponent],
  template: `
    <form [formGroup]="form">
      <app-autocomplete-mat-input
        [form]="form"
        label="Test label"
        formControlName="test"
        [filteredOptions]="filteredOptions" />
    </form>
  `,
})
class HostComponent {
  form = new FormGroup({
    test: new FormControl('test'),
  });
  private base = ['test', 'rest', 'fest', 'det'];

  filteredOptions = this.form.get('test')!.valueChanges.pipe(
    startWith(this.form.get('test')!.value ?? ''),
    map(v => (v ?? '').toString().toLowerCase()),
    map(v => this.base.filter(x => x.toLowerCase().includes(v))),
  );
}

describe('TextInputComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let component: HostComponent;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    component = fixture.componentInstance;

    loader = TestbedHarnessEnvironment.loader(fixture);

    fixture.detectChanges();
  });

  it('TextInputComponent should be created', () => {
    expect(component).toBeTruthy();
  });

  it('TextInputComponent should get initial state', async () => {
    const formField = await loader.getHarness(MatFormFieldHarness);
    const input = await loader.getHarness(MatInputHarness);
    const autocomplete = await loader.getHarness(MatAutocompleteHarness);

    expect(await formField.getLabel()).toBe('Test label');
    expect(await input.getPlaceholder()).toBe('Placeholder');
    expect(await input.getValue()).toBe('test');
    expect(await autocomplete.isOpen()).toBeFalse();
  });

  it('TextInputComponent should open autocomplete and populate it', async () => {
    const autocomplete = await loader.getHarness(MatAutocompleteHarness);
    const input = await loader.getHarness(MatInputHarness);

    await input.focus();
    await input.setValue(await input.getValue());

    await fixture.whenStable();

    expect(await autocomplete.isOpen()).toBeTrue();
    expect(await autocomplete.getValue()).toEqual(await input.getValue());

    //Check options (labels)
    const matOptions = await autocomplete.getOptions();
    const optionsLabels = await Promise.all(matOptions.map(el => el.getText()));

    expect(optionsLabels).toEqual(['test']);

    //Select the first option
    const optionFilters = {
      text: 'test',
    };

    await autocomplete.selectOption(optionFilters);

    await fixture.whenStable();

    const optionsSelections = await Promise.all(matOptions.map(el => el.isSelected()));

    expect(optionsSelections[0]).toBeTrue();
  });

  it('TextInputComponent should filter options', async () => {
    const input = await loader.getHarness(MatInputHarness);
    const autocomplete = await loader.getHarness(MatAutocompleteHarness);

    await input.focus();
    await input.setValue('es');

    await fixture.whenStable();

    const options = await autocomplete.getOptions();

    expect(options.length).toBe(3);
  });
});
