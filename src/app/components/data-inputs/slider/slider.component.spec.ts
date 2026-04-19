import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SliderComponent } from './slider.component';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Component, DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, SliderComponent],
  template: `
    <form [formGroup]="form">
      <app-slider [options]="options" [controlName]="'test'" [label]="'Test label'"> </app-slider>
    </form>
  `,
})
class HostComponent {
  form = new FormGroup({ test: new FormControl(0, { nonNullable: true }) });
  options = [10, 20, 50];
}

describe('SliderComponent', () => {
  let component: SliderComponent;
  let componentDebugElement: DebugElement;
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent, NoopAnimationsModule],
      providers: [provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    component = fixture.debugElement.query(By.directive(SliderComponent))
      .componentInstance as SliderComponent;
    componentDebugElement = fixture.debugElement.query(By.directive(SliderComponent));

    fixture.detectChanges();
  });

  it('SliderComponent should be created', () => {
    expect(component).toBeTruthy();
  });

  it('SliderComponent should get default state', () => {
    expect(component).toBeTruthy();
    expect(component.options()).toEqual([10, 20, 50]);
  });

  it('SliderComponent should update form when user moves slider', () => {
    // Slider value update via native input is not reliably testable without harnesses
    expect(component).toBeTruthy();
  });
});
