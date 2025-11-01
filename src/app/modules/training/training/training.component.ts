import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoaderService } from '../../../services/resolver-loader/loader.service';
import { frontRoutes } from '../../../constants';
import { PageLoaderComponent } from '../../../components/views/page-loader/page-loader.component';

@Component({
  selector: 'app-training',
  imports: [RouterOutlet, PageLoaderComponent],
  templateUrl: './training.component.html',
  styleUrl: './training.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrainingComponent {
  loaderService = inject(LoaderService);
  loader = this.loaderService.getPageLoader(frontRoutes.training);
}
