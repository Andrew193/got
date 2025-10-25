import { Component, input } from '@angular/core';
import { PreviewUnit } from '../../../../models/units-related/unit.model';
import { ControlCustomComponent } from '../form-constructor.models';
import { TrainingSuf } from '../../../../constants';
import { Coordinate } from '../../../../models/field.model';

@Component({
  selector: 'app-hero-preview-data',
  templateUrl: './hero-preview-data.component.html',
  styleUrl: './hero-preview-data.component.scss',
})
export class HeroPreviewDataComponent implements ControlCustomComponent {
  coordinate = input.required<Coordinate>();
  data = input<PreviewUnit>();

  isHighlighted(data: PreviewUnit) {
    return data.name.includes(TrainingSuf.ai);
  }
}
