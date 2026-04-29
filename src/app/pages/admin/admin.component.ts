import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { NewsConstructorComponent } from './news-constructor/news-constructor.component';
import { NavigationService } from '../../services/facades/navigation/navigation.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [MatTabsModule, NewsConstructorComponent],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminComponent {
  nav = inject(NavigationService);

  goBack = () => {
    this.nav.goToMainPage();
  };
}
