import { Component, Input } from '@angular/core';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { Unit } from '../../models/unit.model';
import { ImageComponent } from '../views/image/image.component';

@Component({
  selector: 'app-heroes-select-preview',
  imports: [TooltipModule, ImageComponent],
  templateUrl: './heroes-select-preview.component.html',
  styleUrl: './heroes-select-preview.component.scss',
})
export class HeroesSelectPreviewComponent {
  @Input() units: Unit[] = [];
  @Input() title = '';
  @Input() containerClass = '';
  @Input() user = false;
  @Input() toggleDescription: (user: boolean, index: number) => void = (user, index) => {};
  @Input() getDescriptionState: (user: boolean, index: number) => boolean = (user, index) => false;
}
