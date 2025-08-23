import {Component, Input} from '@angular/core';
import {CommonModule} from "@angular/common";

@Component({
    selector: 'image',
    imports: [CommonModule],
    templateUrl: './image.component.html',
    styleUrl: './image.component.scss'
})
export class ImageComponent {
  @Input({required: true}) source!: string;
  @Input({required: true}) alt!: string;
  @Input() useFixSize: boolean = false;
  @Input() imageClass: string = '';

  loading: boolean = true

  onLoad() {
    this.loading = false;
  }
}
