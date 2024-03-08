import { Component } from '@angular/core';
import {RouterOutlet} from "@angular/router";
import {HeaderComponent} from "../../components/common/header/header.component";
import {CommonModule} from "@angular/common";
import {GameFieldComponent} from "../../components/game-field/game-field.component";
import {ModalWindowComponent} from "../../components/modal-window/modal-window.component";

@Component({
  selector: 'app-site',
  standalone: true,
    imports: [
        RouterOutlet,
        HeaderComponent,
        CommonModule,
        GameFieldComponent,
        ModalWindowComponent
    ],
  templateUrl: './site.component.html',
  styleUrl: './site.component.scss'
})
export class SiteComponent {
}
