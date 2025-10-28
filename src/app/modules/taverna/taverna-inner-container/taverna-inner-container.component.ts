import { Component } from '@angular/core';
import { TavernaHeroesBarComponent } from '../taverna-heroes-bar/taverna-heroes-bar.component';
import { TavernaFacadeService } from '../../../services/facades/taverna/taverna.service';
import { TavernaHeroesTableComponent } from '../taverna-heroes-table/taverna-heroes-table.component';

@Component({
  selector: 'app-taverna-inner-container',
  imports: [TavernaHeroesBarComponent, TavernaHeroesTableComponent],
  providers: [TavernaFacadeService],
  templateUrl: './taverna-inner-container.component.html',
  styleUrl: './taverna-inner-container.component.scss',
})
export class TavernaInnerContainerComponent {
  constructor() {}
}
