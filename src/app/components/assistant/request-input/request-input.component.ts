import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TextInputComponent } from '../../data-inputs/text-input/text-input.component';
import { MatIcon } from '@angular/material/icon';
import { MatMiniFabButton } from '@angular/material/button';
import { Store } from '@ngrx/store';
import { selectRecordsLoading } from '../../../store/reducers/assistant.reducer';
import { AsyncPipe } from '@angular/common';
import { ASSISTANT_FACADE, ASSISTANT_MEMORY_TYPE } from '../../../models/tokens';
import { AssistantRequestInputComponent } from '../../../models/interfaces/assistant.interface';

@Component({
  selector: 'app-request-input',
  imports: [ReactiveFormsModule, TextInputComponent, MatIcon, MatMiniFabButton, AsyncPipe],
  templateUrl: './request-input.component.html',
  styleUrl: './request-input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RequestInputComponent implements AssistantRequestInputComponent {
  store = inject(Store);
  facade = inject(ASSISTANT_FACADE);
  assistantMemoryType = inject(ASSISTANT_MEMORY_TYPE);

  constructor() {
    this.facade.assistantService.assistant.setMemoryType(this.assistantMemoryType);
  }

  form = this.facade.getAssistantFormGroup();

  submitAssistantForm = this.facade.assistantService.submitAssistantForm;

  isLoading = this.store.select(selectRecordsLoading());
}
