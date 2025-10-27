import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { PreviewUnit } from '../../../models/units-related/unit.model';
import { ImageComponent } from '../../views/image/image.component';
import { MatTooltip } from '@angular/material/tooltip';
import { BasicStoresHolderComponent } from '../../views/basic-stores-holder/basic-stores-holder.component';
import { MatDrawer, MatDrawerContainer } from '@angular/material/sidenav';

@Component({
  selector: 'app-heroes-select-preview',
  imports: [ImageComponent, MatTooltip, BasicStoresHolderComponent, MatDrawerContainer, MatDrawer],
  templateUrl: './heroes-select-preview.component.html',
  styleUrl: './heroes-select-preview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroesSelectPreviewComponent {
  units = input<PreviewUnit[]>([]);
  title = input('');
  containerClass = input('');
}
