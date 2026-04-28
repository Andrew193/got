import { ChangeDetectionStrategy, Component, inject, input, OnInit, output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { of } from 'rxjs';
import { HeroBlock } from '../../../../../models/watchtower/watchtower.model';
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
export class HeroBlockComponent implements OnInit {
  private fb = inject(FormBuilder);

  block = input.required<HeroBlock>();
  blockChange = output<HeroBlock>();
  remove = output<void>();

  form!: FormGroup;

  heroOptions = of<LabelValue[]>(
    Object.values(HeroesNamesCodes).map(hero => ({
      value: hero,
      label: hero,
    })),
  );

  ngOnInit(): void {
    this.form = this.fb.group({
      heroName: [this.block().heroName, Validators.required],
    });

    this.form.get('heroName')?.valueChanges.subscribe(heroName => {
      this.blockChange.emit({ ...this.block(), heroName });
    });
  }
}
