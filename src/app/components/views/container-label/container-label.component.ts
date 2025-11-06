import { Component, contentChild, input, TemplateRef } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-container-label',
  imports: [MatIcon],
  templateUrl: './container-label.component.html',
  styleUrl: './container-label.component.scss',
})
export class ContainerLabelComponent {
  projectedContent = contentChild<TemplateRef<any>>('content');
  size = input(50);
}
