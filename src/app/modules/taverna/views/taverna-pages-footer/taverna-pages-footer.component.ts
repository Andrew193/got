import { Component, inject } from '@angular/core';
import { NavigationService } from '../../../../services/facades/navigation/navigation.service';

@Component({
  selector: 'app-taverna-pages-footer',
  imports: [],
  templateUrl: './taverna-pages-footer.component.html',
  styleUrl: './taverna-pages-footer.component.scss',
})
export class TavernaPagesFooterComponent {
  nav = inject(NavigationService);

  backToTavern = () => this.nav.goToTaverna();
  backToMainPage = () => this.nav.goToMainPage();
}
