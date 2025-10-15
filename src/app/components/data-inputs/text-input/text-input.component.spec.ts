import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TextInputComponent } from './text-input.component';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { HarnessLoader } from '@angular/cdk/testing';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, TextInputComponent],
  template: `
    <form [formGroup]="form">
      <app-text-input controlName="test" label="Test label" />
    </form>
  `,
})
class HostComponent {
  form = new FormGroup({ test: new FormControl('test text', { nonNullable: true }) });
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
});
