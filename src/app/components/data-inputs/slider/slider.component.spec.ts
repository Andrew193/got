import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { SliderComponent } from './slider.component';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Component, DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatSliderHarness } from '@angular/material/slider/testing';

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

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [HostComponent, NoopAnimationsModule],
    });

    fixture = TestBed.createComponent(HostComponent);
    component = fixture.debugElement.query(By.directive(SliderComponent))
      .componentInstance as SliderComponent;
    componentDebugElement = fixture.debugElement.query(By.directive(SliderComponent));

    fixture.detectChanges();
  }));

  it('SliderComponent should be created', () => {
    expect(component).toBeTruthy();
  });

  it('SliderComponent should get default state', () => {
    const controlValue = component.control.value;
    const parentForm = component.parentForm;

    expect(controlValue).toBe(0);
    expect(parentForm.touched).toBeFalse();
    expect(parentForm.dirty).toBeFalse();
    expect(component.options()).toEqual([10, 20, 50]);
    expect(component.label()).toBe('Test label');

    //Check UI
    const labelsContainer = componentDebugElement.query(By.css('.tick-labels'));
    const labels = labelsContainer.queryAll(By.css('.tick'));

    expect(labels.length).toBe(3);

    const textLabels = labels.map(el =>
      parseInt((el.nativeNode as HTMLSpanElement).textContent || ''),
    );

    expect(textLabels).toEqual([10, 20, 50]);
  });

  it('SliderComponent should update form when user moves slider', async () => {
    const loader = TestbedHarnessEnvironment.loader(fixture);
    const slider = await loader.getHarness(
      MatSliderHarness.with({ selector: 'app-slider mat-slider' }),
    );
    const thumb = await slider.getEndThumb();

    await thumb.setValue(await thumb.getMaxValue());
    fixture.detectChanges();

    expect(fixture.componentInstance.form.get('test')!.value).toBe(await thumb.getMaxValue());
    expect(await thumb.getDisplayValue()).toBe('50');
  });
});
