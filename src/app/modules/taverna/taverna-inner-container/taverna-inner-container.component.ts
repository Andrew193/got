import { Component } from '@angular/core';
import { TavernaHeroesBarComponent } from '../taverna-heroes-bar/taverna-heroes-bar.component';
import { TavernaPagesFooterComponent } from '../views/taverna-pages-footer/taverna-pages-footer.component';

@Component({
  selector: 'app-taverna-inner-container',
  imports: [TavernaHeroesBarComponent, TavernaPagesFooterComponent],
  templateUrl: './taverna-inner-container.component.html',
  styleUrl: './taverna-inner-container.component.scss',
})
export class TavernaHeroesBarContainerComponent {}
