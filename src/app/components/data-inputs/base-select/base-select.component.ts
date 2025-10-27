import { ChangeDetectionStrategy, Component, Input, input, model, OnInit } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { MatFormField, MatLabel } from '@angular/material/input';
import { ControlContainer, FormGroupDirective, ReactiveFormsModule } from '@angular/forms';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatIcon } from '@angular/material/icon';
import { ViewProviderComponent } from '../../abstract/abstract-control/view-provider/view-provider.component';
import { BehaviorSubject, Observable, of, take } from 'rxjs';
import { Source } from '../../../models/api.model';
import { MatOptionSelectionChange } from '@angular/material/core';

@Component({
  selector: 'app-base-select',
  imports: [MatFormField, MatSelect, ReactiveFormsModule, MatOption, MatIcon, AsyncPipe, MatLabel],
  templateUrl: './base-select.component.html',
  styleUrl: './base-select.component.scss',
  viewProviders: [{ provide: ControlContainer, useExisting: FormGroupDirective }],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BaseSelectComponent extends ViewProviderComponent implements OnInit {
  withReset = input<boolean>(false);
  closeAfterOptionSelection = input<boolean>(false);
  className = input<string>('');
  source = input<Source | null>(null);
  isMulti = model<boolean | null>(null);

  @Input() staticOptions: Observable<string[]> = of([]);
  options = new BehaviorSubject<string[]>([]);

  onClear(event: Event) {
    event.stopPropagation();
    this.formControl.reset();
  }

  ngOnInit() {
    this.staticOptions.pipe(take(1)).subscribe(res => {
      this.options.next(res);
    });

    const isMulti = this.isMulti();
    const source = this.source();

    if (isMulti === null) {
      this.isMulti.set(Array.isArray(this.formControl.value));
    }

    if (source) {
      this.dataInputsService.getSelectOptions(source).subscribe(res => {
        console.log(res);
        //this.options.next(res)
      });
    }
  }

  valueChange() {
    this.action && this.action(this.controlName(), this.parentForm);
  }

  onOptionSelection(e: MatOptionSelectionChange, select: MatSelect) {
    if (e.isUserInput && e.source.selected) {
      this.closeAfterOptionSelection() && select.close();
    }
  }
}
