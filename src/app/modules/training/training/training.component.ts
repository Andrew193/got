import {Component} from '@angular/core';
import {CommonModule} from "@angular/common";
import {RouterOutlet} from "@angular/router";

@Component({
    selector: 'training',
    imports: [
        CommonModule,
        RouterOutlet
    ],
    templateUrl: './training.component.html',
    styleUrl: './training.component.scss'
})
export class TrainingComponent {
  constructor() {
  }
}
