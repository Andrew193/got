import { Component } from '@angular/core';
import { TavernaHeroesBarComponent } from '../taverna-heroes-bar/taverna-heroes-bar.component';
import { TavernaFacadeService } from '../../../services/facades/taverna/taverna.service';

@Component({
  selector: 'app-taverna-inner-container',
  imports: [TavernaHeroesBarComponent],
  providers: [TavernaFacadeService],
  templateUrl: './taverna-inner-container.component.html',
  styleUrl: './taverna-inner-container.component.scss',
})
export class TavernaInnerContainerComponent {
  constructor() {}
}
