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

  parseRecords(records: AssistantRecord[], keywords: string[]): ViewAssistantRecord[] {
    return records.map(record => {
      return {
        ...record,
        keywords: this.textService.getKeywordsFromText(record.message, keywords),
      };
    });
  }
}
