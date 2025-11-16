import { Component, inject, input } from '@angular/core';
import { NavigationService } from '../../../../services/facades/navigation/navigation.service';

@Component({
  selector: 'app-taverna-pages-footer',
  imports: [],
  templateUrl: './taverna-pages-footer.component.html',
  styleUrl: './taverna-pages-footer.component.scss',
})
export class TavernaPagesFooterComponent {
  nav = inject(NavigationService);

  showTavernButton = input(true);
  showMainPageButton = input(true);

  backToMainPageCallback = input(() => {});
  backToTavernCallback = input(() => {});

  backToTavern = () => {
    this.backToTavernCallback()();
    this.nav.goToTaverna();
  };

  backToMainPage = () => {
    this.backToMainPageCallback()();
    this.nav.goToMainPage();
  };
}
