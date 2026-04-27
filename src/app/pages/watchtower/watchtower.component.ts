import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatExpansionModule } from '@angular/material/expansion';
import { WatchtowerFacadeService } from './services/watchtower-facade.service';
import { WatchtowerGenericTableComponent } from './watchtower-generic-table/watchtower-generic-table.component';
import { WatchtowerHeroBlockComponent } from './watchtower-hero-block/watchtower-hero-block.component';
import { NewsConfig } from '../../models/watchtower/watchtower.model';
import { NavigationService } from '../../services/facades/navigation/navigation.service';

@Component({
  selector: 'app-watchtower',
  imports: [MatExpansionModule, WatchtowerGenericTableComponent, WatchtowerHeroBlockComponent],
  templateUrl: './watchtower.component.html',
  styleUrl: './watchtower.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WatchtowerComponent implements OnInit {
  private facade = inject(WatchtowerFacadeService);
  private destroyRef = inject(DestroyRef);
  nav = inject(NavigationService);

  news = signal<NewsConfig[]>([]);
  isLoading = signal(true);
  error = signal(false);

  goToMainPage() {
    this.nav.goToMainPage();
  }

  ngOnInit() {
    this.facade
      .getNews()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: data => {
          this.news.set(data);
          this.isLoading.set(false);
        },
        error: () => {
          this.error.set(true);
          this.isLoading.set(false);
        },
      });
  }
}
