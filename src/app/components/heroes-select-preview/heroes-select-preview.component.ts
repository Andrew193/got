import { ChangeDetectionStrategy, Component, input, Input } from '@angular/core';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { PreviewUnit } from '../../models/unit.model';
import { ImageComponent } from '../views/image/image.component';

@Component({
  selector: 'app-heroes-select-preview',
  imports: [TooltipModule, ImageComponent],
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
