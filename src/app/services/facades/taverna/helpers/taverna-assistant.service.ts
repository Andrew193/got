import { inject, Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { TavernaAssistantForm } from '../../../../models/taverna/taverna.model';
import { AssistantRecord, ViewAssistantRecord } from '../../../../store/store.interfaces';
import { Store } from '@ngrx/store';
import { AssistantActions } from '../../../../store/actions/assistant.actions';
import { TextService } from '../../../text/text.service';
import { AssistantService } from '../../assistant/assistant.service';

@Injectable({
  providedIn: 'root',
})
export class TavernaAssistantService {
  store = inject(Store);
  textService = inject(TextService);
  assistant = inject(AssistantService);

  private _form = new FormGroup<TavernaAssistantForm>(
    {
      request: new FormControl('', { nonNullable: true }),
    },
    { updateOn: 'blur' },
  );

  getForm() {
    return this._form;
  }

  public submitAssistantForm = () => {
    const newRequest = this.createRequest();

    this._form.reset();
    this.store.dispatch(AssistantActions.toggleLoading());

    setTimeout(() => {
      this.store.dispatch(AssistantActions.addRequest({ data: newRequest }));
      this.store.dispatch(AssistantActions.toggleLoading());
    }, 3000);
  };

  y = false;

  private createRequest(): AssistantRecord {
    const { request } = this._form.getRawValue();

    this.y = !this.y;

    return {
      message: request,
      request: this.y,
      id: crypto.randomUUID(),
    };
  }

  parseRecords(records: AssistantRecord[], keywords: string[]): ViewAssistantRecord[] {
    return records.map(record => {
      return {
        ...record,
        keywords: this.textService.getKeywordsFromText(record.message, keywords),
      };
    });
  }
}
