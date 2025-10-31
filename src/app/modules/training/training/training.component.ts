import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { ElementLoaderDirective } from '../../../directives/loaders/element-loader.directive';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-training',
  imports: [
    RouterOutlet,
    MatProgressSpinner,
    MatProgressSpinner,
    MatProgressSpinner,
    MatProgressSpinner,
    ElementLoaderDirective,
  ],
  templateUrl: './training.component.html',
  styleUrl: './training.component.scss',
})
export class TrainingComponent {
  loader = new BehaviorSubject<boolean>(true);

  constructor() {
    setTimeout(() => {
      this.loader.next(false);
    }, 2000);
  }
}
