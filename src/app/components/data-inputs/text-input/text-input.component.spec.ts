import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TextInputComponent } from './text-input.component';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatFormFieldHarness } from '@angular/material/form-field/testing';
import { MatInputHarness } from '@angular/material/input/testing';
import { HarnessLoader } from '@angular/cdk/testing';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, TextInputComponent],
  template: `
    <form [formGroup]="form">
      <app-number-input controlName="test" label="Test label" />
    </form>
  `,
})
class HostComponent {
  form = new FormGroup({ test: new FormControl(0, { nonNullable: true }) });
}

describe('TextInputComponent', () => {
  let hostComponent: HostComponent;
  let loader: HarnessLoader;
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    hostComponent = fixture.componentInstance;

    loader = TestbedHarnessEnvironment.loader(fixture);

    fixture.detectChanges();
  });

  it('TextInputComponent should de created', () => {
    expect(hostComponent).toBeTruthy();
  });

  it('TextInputComponent should get correct initial state', async () => {
    const formFieldHarness = await loader.getHarness(MatFormFieldHarness);
    const inputHarness = await loader.getHarness(MatInputHarness);

    const label = await formFieldHarness.getLabel();

    expect(label).toBe('Test label');
    expect(await inputHarness.getValue()).toBe('0');
    expect(await inputHarness.getType()).toBe('number');
  });

  it('TextInputComponent should update value', async () => {
    const input = await loader.getHarness(MatInputHarness);

    await input.setValue('New');

    fixture.detectChanges();

    expect(await input.getValue()).toBeFalsy();

    //Real value
    await input.setValue('35');
    fixture.detectChanges();
    expect(await input.getValue()).toBe('35');
  });
});
