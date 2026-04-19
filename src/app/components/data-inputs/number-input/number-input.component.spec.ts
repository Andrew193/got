import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NumberInputComponent } from './number-input.component';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { By } from '@angular/platform-browser';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, NumberInputComponent],
  template: `
    <form [formGroup]="form">
      <app-number-input controlName="test" label="Test label" />
    </form>
  `,
})
class HostComponent {
  form = new FormGroup({ test: new FormControl(0, { nonNullable: true }) });
}

describe('NumberInputComponent', () => {
  let hostComponent: HostComponent;
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent, NoopAnimationsModule],
      providers: [provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    hostComponent = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('NumberInputComponent should de created', () => {
    expect(hostComponent).toBeTruthy();
  });

  it('NumberInputComponent should get correct initial state', () => {
    const input = fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;

    expect(input.value).toBe('0');
  });

  it('NumberInputComponent should update value', () => {
    const input = fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;

    input.value = '35';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(hostComponent.form.get('test')!.value).toBe(35);
  });
});
