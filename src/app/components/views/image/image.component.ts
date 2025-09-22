import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-image',
  imports: [CommonModule],
  templateUrl: './image.component.html',
  styleUrl: './image.component.scss',
})
export class ImageComponent {
  @Input({ required: true }) source!: string;
  @Input({ required: true }) alt!: string;
  @Input() useFixSize = false;
  @Input() imageClass = '';

  loading = true;

  onLoad() {
    this.loading = false;
  }
}
