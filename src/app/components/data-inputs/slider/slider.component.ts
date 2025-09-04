import {ChangeDetectionStrategy, Component, input} from '@angular/core';
import {ControlContainer, FormGroupDirective, ReactiveFormsModule} from "@angular/forms";
import {MatSlider, MatSliderThumb} from "@angular/material/slider";
import {NgForOf} from "@angular/common";
import {ViewProviderComponent} from "../../abstract/abstract-control/view-provider/view-provider.component";

@Component({
  selector: 'app-slider',
  imports: [
    MatSlider,
    ReactiveFormsModule,
    NgForOf,
    MatSliderThumb
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './slider.component.html',
  viewProviders: [{ provide: ControlContainer, useExisting: FormGroupDirective}],
  styleUrl: './slider.component.scss'
})
export class SliderComponent extends ViewProviderComponent {
  readonly options = input.required<number[]>();

  formatLabel = (idx: number | null) =>
    idx == null ? '' : String(this.options()[idx]);
}
