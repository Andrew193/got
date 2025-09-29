import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-image',
  imports: [NgClass],
  templateUrl: './image.component.html',
  styleUrl: './image.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageComponent {
  source = input.required<string>();
  alt = input.required<string>();
  useFixSize = input(false);
  imageClass = input('');

  loading = true;

  onLoad() {
    this.loading = false;
  }
}
