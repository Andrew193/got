import { Component } from '@angular/core';
import {TavernaHeroesBarComponent} from "../taverna-heroes-bar/taverna-heroes-bar.component";
import {ModalWindowComponent} from "../modal-window/modal-window.component";
import {RouterOutlet} from "@angular/router";

@Component({
  selector: 'app-taverna',
  standalone: true,
  imports: [
    TavernaHeroesBarComponent,
    ModalWindowComponent,
    RouterOutlet
  ],
  templateUrl: './taverna.component.html',
  styleUrl: './taverna.component.scss'
})
export class TavernaComponent {

}
