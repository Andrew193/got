import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ElementLoaderDirective } from '../../../directives/loaders/element-loader.directive';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-page-loader',
  imports: [ElementLoaderDirective, MatProgressSpinner],
  templateUrl: './page-loader.component.html',
  styleUrl: './page-loader.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageLoaderComponent {
  loader = input.required<Observable<boolean>>();
}
