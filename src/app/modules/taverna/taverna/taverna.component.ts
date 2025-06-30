import {Component} from '@angular/core';
import {RouterOutlet} from "@angular/router";

@Component({
  selector: 'app-taverna',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './taverna.component.html',
  styleUrl: './taverna.component.scss'
})
export class TavernaComponent {
}
