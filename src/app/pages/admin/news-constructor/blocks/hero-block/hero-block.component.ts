import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { of } from 'rxjs';
import { HeroesNamesCodes } from '../../../../../models/units-related/unit.model';
import { BaseSelectComponent } from '../../../../../components/data-inputs/base-select/base-select.component';
import { LabelValue } from '../../../../../components/form/enhancedFormConstructor/form-constructor.models';

@Component({
  selector: 'app-hero-block',
  standalone: true,
  imports: [ReactiveFormsModule, MatButtonModule, MatIconModule, BaseSelectComponent],
  templateUrl: './hero-block.component.html',
  styleUrl: './hero-block.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroBlockComponent {
  formGroup = input.required<FormGroup>();
  remove = output<void>();

  heroOptions = of<LabelValue[]>(
    Object.values(HeroesNamesCodes).map(hero => ({
      value: hero,
      label: hero,
    })),
  );
}
