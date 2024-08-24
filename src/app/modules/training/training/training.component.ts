import {Component} from '@angular/core';
import {GameEntryPointComponent} from "../../../components/game-entry-point/game-entry-point.component";
import {CommonModule} from "@angular/common";
import {RouterOutlet} from "@angular/router";

@Component({
  selector: 'training',
  standalone: true,
  imports: [
    GameEntryPointComponent,
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
