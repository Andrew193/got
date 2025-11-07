import { inject, Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { AssistantActions } from '../../../../store/actions/assistant.actions';
import { AssistantService } from '../../assistant/assistant.service';
import {
  AssistantForm,
  AssistantServiceUser,
} from '../../../../models/interfaces/assistant.interface';

@Injectable({
  providedIn: 'root',
})
export class TavernaAssistantService implements AssistantServiceUser {
  store = inject(Store);
  assistant = inject(AssistantService);

  form = new FormGroup<AssistantForm>({
    request: new FormControl('', { nonNullable: true }),
  });

  getForm() {
    return this.form;
  }

  public submitAssistantForm = () => {
    const newRequest = this.assistant.createRequest(this.form.getRawValue().request, true);

    this.form.reset();
    this.store.dispatch(AssistantActions.addRequest({ data: newRequest }));
  };
}
