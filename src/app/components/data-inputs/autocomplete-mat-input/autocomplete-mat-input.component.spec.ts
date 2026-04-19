import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AutocompleteMatInputComponent } from './autocomplete-mat-input.component';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { Component } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, AutocompleteMatInputComponent],
  template: `
    <form [formGroup]="form">
      <app-autocomplete-mat-input
        [form]="form"
        label="Test label"
        [controlName]="'test'"
        [filteredOptions]="filteredOptions" />
    </form>
  `,
})
class HostComponent {
  form = new FormGroup({ test: new FormControl('test') });
  filteredOptions = of(['test', 'rest']);
}

describe('TextInputComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let component: HostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent, NoopAnimationsModule],
      providers: [provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('TextInputComponent should be created', () => {
    expect(component).toBeTruthy();
  });

  it('TextInputComponent should get initial state', () => {
    expect(component.form.get('test')!.value).toBe('test');
  });

  it('TextInputComponent should filter options', () => {
    component.form.get('test')!.setValue('es');
    fixture.detectChanges();
    expect(component.form.get('test')!.value).toBe('es');
  });

  it('TextInputComponent should open autocomplete and populate it', () => {
    expect(component.form.get('test')!.value).toBe('test');
  });
});
