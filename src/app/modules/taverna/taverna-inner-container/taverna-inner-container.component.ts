import { Component } from '@angular/core';
import { TavernaHeroesBarComponent } from '../taverna-heroes-bar/taverna-heroes-bar.component';

@Component({
  selector: 'app-taverna-inner-container',
  imports: [TavernaHeroesBarComponent],
  templateUrl: './taverna-inner-container.component.html',
  styleUrl: './taverna-inner-container.component.scss',
})
export class TavernaInnerContainerComponent {}
