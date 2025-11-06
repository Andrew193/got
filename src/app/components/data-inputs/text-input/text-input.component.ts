import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { ControlContainer, FormGroupDirective, ReactiveFormsModule } from '@angular/forms';
import { ViewProviderComponent } from '../../abstract/abstract-control/view-provider/view-provider.component';

type InputTypes = 'text' | 'password';

@Component({
  selector: 'app-text-input',
  imports: [MatFormField, MatInput, MatLabel, MatFormField, ReactiveFormsModule],
  templateUrl: './text-input.component.html',
  viewProviders: [{ provide: ControlContainer, useExisting: FormGroupDirective }],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './text-input.component.scss',
})
export class TextInputComponent extends ViewProviderComponent {
  type = input<InputTypes>('text');
  renderTextarea = input<boolean>(false);
}
