import { ChangeDetectionStrategy, Component, Input, input, model, OnInit } from '@angular/core';
import { AsyncPipe, NgForOf, NgIf } from '@angular/common';
import { MatFormField, MatLabel } from '@angular/material/input';
import { ControlContainer, FormGroupDirective, ReactiveFormsModule } from '@angular/forms';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatIcon } from '@angular/material/icon';
import { ViewProviderComponent } from '../../abstract/abstract-control/view-provider/view-provider.component';
import { Observable, of } from 'rxjs';
import { Source } from '../../../models/api.model';

@Component({
  selector: 'app-base-select',
  imports: [
    MatFormField,
    NgIf,
    MatSelect,
    ReactiveFormsModule,
    MatOption,
    NgForOf,
    MatIcon,
    AsyncPipe,
    MatLabel,
  ],
  templateUrl: './base-select.component.html',
  styleUrl: './base-select.component.scss',
  viewProviders: [{ provide: ControlContainer, useExisting: FormGroupDirective }],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BaseSelectComponent extends ViewProviderComponent implements OnInit {
  withReset = input<boolean>(false);
  className = input<string>('');
  source = input<Source | null>(null);
  isMulti = model<boolean | null>(null);

  @Input() filteredOptions: Observable<string[]> = of([]);

  onClear(event: Event) {
    event.stopPropagation();
    this.formControl.reset();
  }

  ngOnInit() {
    const isMulti = this.isMulti();
    const source = this.source();

    if (isMulti === null) {
      this.isMulti.set(Array.isArray(this.formControl.value));
    }

    if (source) {
      this.dataInputsService.getSelectOptions(source).subscribe(res => {
        console.log(res);
      });
    }

    this.formControl.valueChanges.subscribe(() => {
      this.action && this.action(this.controlName(), this.parentForm);
    });
  }
}
