import { inject, Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { TavernaAssistantForm } from '../../../../models/taverna/taverna.model';
import { Store } from '@ngrx/store';
import { AssistantActions } from '../../../../store/actions/assistant.actions';
import { AssistantService } from '../../assistant/assistant.service';

@Injectable({
  providedIn: 'root',
})
export class TavernaAssistantService {
  store = inject(Store);
  assistant = inject(AssistantService);

  private _form = new FormGroup<TavernaAssistantForm>({
    request: new FormControl('', { nonNullable: true }),
  });

  getForm() {
    return this._form;
  }

  public submitAssistantForm = () => {
    const newRequest = this.assistant.createRequest(this._form.getRawValue().request, true);

    this._form.reset();
    this.store.dispatch(AssistantActions.addRequest({ data: newRequest }));
  };
}
