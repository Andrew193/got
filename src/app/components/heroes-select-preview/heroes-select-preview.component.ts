import { ChangeDetectionStrategy, Component, input, Input } from '@angular/core';
import { PreviewUnit } from '../../models/units-related/unit.model';
import { ImageComponent } from '../views/image/image.component';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
  selector: 'app-heroes-select-preview',
  imports: [ImageComponent, MatTooltip],
  templateUrl: './heroes-select-preview.component.html',
  styleUrl: './heroes-select-preview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroesSelectPreviewComponent {
  units = input<PreviewUnit[]>([]);
  title = input('');
  containerClass = input('');
  user = input(false);
  @Input() toggleDescription: (user: boolean, index: number) => void = (user, index) => {};
  @Input() getDescriptionState: (user: boolean, index: number) => boolean = (user, index) => false;
}
