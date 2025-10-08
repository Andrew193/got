import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgClass, NgStyle } from '@angular/common';

@Component({
  selector: 'app-image',
  imports: [NgClass, NgStyle],
  templateUrl: './image.component.html',
  styleUrl: './image.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageComponent {
  source = input.required<string>();
  backgroundImageUrl = computed(() => `url(${this.source()})`);

  alt = input.required<string>();
  useFixSize = input(false);
  imageClass = input('');
  renderAsBackground = input(false);

  loading = true;

  onLoad() {
    this.loading = false;
  }
}
