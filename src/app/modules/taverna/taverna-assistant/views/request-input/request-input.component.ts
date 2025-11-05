import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TavernaFacadeService } from '../../../../../services/facades/taverna/taverna.service';
import { ReactiveFormsModule } from '@angular/forms';
import { TextInputComponent } from '../../../../../components/data-inputs/text-input/text-input.component';
import { MatIcon } from '@angular/material/icon';
import { MatMiniFabButton } from '@angular/material/button';
import { Store } from '@ngrx/store';
import { selectRecordsLoading } from '../../../../../store/reducers/assistant.reducer';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-request-input',
  imports: [ReactiveFormsModule, TextInputComponent, MatIcon, MatMiniFabButton, AsyncPipe],
  templateUrl: './request-input.component.html',
  styleUrl: './request-input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RequestInputComponent {
  store = inject(Store);

  facade = inject(TavernaFacadeService);
  form = this.facade.getAssistantFormGroup();
  submitAssistantForm = this.facade.assistantService.submitAssistantForm;

  isLoading = this.store.select(selectRecordsLoading());
}
